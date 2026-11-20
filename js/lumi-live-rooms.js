/**
 * LUMI Messenger — pokoje LIVE TV (Strażnik Claude, 2026-10-19)
 *
 * • Zakładka „📺 LIVE TV” w LUMI Messenger: osobny pokój dla każdego kanału nadawczego.
 * • Codziennie o 09:00 (czas polski) Noemi i Sara prowadzą w pokojach rozważanie na żywo —
 *   ta sama oś czasu co na antenie (js/cc-tv-dialogue.js), więc każdy widzi te same słowa w tej samej chwili.
 *   Ich rozmowa pojawia się też na czacie ogólnym.
 * • Wiadomości widzów: Firestore lumina_live_rooms/{roomId}/messages (reguły: tylko zalogowani członkowie,
 *   bez kont dzieci, tylko tekst do 1000 znaków; usuwa autor albo administrator).
 * • Pokój „Zjednoczeni za Polskę”: modlitwy (kind: 'prayer') trafiają na antenę /zapolske-live po kilku sekundach.
 * Koszt: zero — bez serwera; wpisy prowadzących są liczone w przeglądarce z dzisiejszego scenariusza.
 */
import { getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore, collection, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const prayerEn = new URLSearchParams(window.location?.search).get('lang') === 'en';
const prayerCopy = prayerEn ? {
  name: '40 Days of Prayer', plan: 'Prayer plan', back: 'Back to rooms', host: 'Rut · virtual CC host',
  welcome: 'Welcome. Choose a day in your plan or use my help to find the right Christian Culture resource.',
  help: 'Talk to Rut', privacy: 'Signed-in LUMINA members can read these messages. Keep other people’s names and sensitive requests private.',
  guest: 'Sign in to LUMINA to enter the prayer room.', denied: 'This account cannot access the prayer room.',
  empty: 'The room is ready for its first message.', input: 'Write a short prayer…', send: 'Send'
} : {
  name: '40 Dni Modlitwy', plan: 'Plan 40DM', back: 'Wróć do listy pokoi', host: 'Rut · wirtualna gospodyni CC',
  welcome: 'Witaj. Wybierz dzień w planie albo poproś mnie o pomoc w znalezieniu materiałów Christian Culture.',
  help: 'Porozmawiaj z Rut', privacy: 'Treść widzą zalogowani członkowie LUMINA. Nie wpisuj cudzych intencji ani danych wrażliwych.',
  guest: 'Zaloguj się w LUMINA, aby wejść do pokoju.', denied: 'Konto nie ma dostępu do tego pokoju.',
  empty: 'Pokój jest gotowy na pierwszą wiadomość.', input: 'Napisz krótką modlitwę…', send: 'Wyślij'
};

export const LIVE_ROOMS = [
  { id: 'prayer_40dm', name: prayerCopy.name, url: prayerEn ? '/40DM/en/' : '/40DM/', logo: '/40DM/room.jpg', memberOnly: true,
    placeholder: prayerCopy.input, desc: 'Pokój modlitwy dla zalogowanych członków LUMINA. Nie podawaj wrażliwych danych.' },
  { id: 'tv_cctv24', name: 'CCTV24 · Telewizja Śniadaniowa', url: '/cctv24', icon: '📺', reflection: true, desc: 'Rozważanie „Z Biblią za Pan Brat” z Noemi i Sarą — na żywo.' },
  { id: 'tv_zapolske', name: 'Zjednoczeni za Polskę', url: '/zapolske-live', icon: '🇵🇱', reflection: true, prayers: true, desc: 'Módl się z nami — Twoja modlitwa pojawi się na antenie.' },
  // BCM24 (2026-10-23): całodobowy kanał modlitwy — intencje z kategorią trafiają na antenę /BCM24 po kilku sekundach.
  { id: 'tv_bcm24', name: 'Biblijny Czas Modlitwy 24/7', url: '/BCM24', icon: '🙏', prayers: true, categories: true,
    placeholder: 'Napisz intencję lub podziękowanie…',
    prayerLabel: '🙏 Pokaż na antenie „Biblijny Czas Modlitwy 24/7”',
    prayerNote: '🙏 Intencje, prośby, podziękowania i życzenia z tego pokoju pojawiają się na antenie /BCM24 po kilku sekundach — modlimy się za nie całą dobę. Treści z linkami, numerami telefonów lub wulgaryzmami nie trafiają na antenę. Nie podawaj wrażliwych danych.',
    liveBarText: 'Twoja intencja trafiła na antenę Biblijny Czas Modlitwy 24/7. Modlimy się razem.',
    desc: 'Całodobowa modlitwa — Twoja intencja pojawi się na antenie.' },
  { id: 'tv_master_live', name: 'Master Live · Główna antena', url: '/live', icon: '🎬', reflection: true, desc: 'Główna antena Christian Culture TV.' },
  { id: 'tv_cctv24_pl', name: 'CCTV24 PL', url: '/cctv24-pl', icon: '📡', reflection: true, desc: 'Kopia transmisyjna CCTV24.' },
  { id: 'tv_worship', name: 'CCTV24 Worship', url: '/cctv24-worship', icon: '🎶', desc: 'Uwielbienie na żywo przez całą dobę.' },
  { id: 'tv_biblia_spiewana', name: 'Biblia Śpiewana LIVE', url: '/biblia-spiewana-live', icon: '📖', desc: 'Śpiewamy Pismo Święte razem.' }
];
const ROOM = Object.fromEntries(LIVE_ROOMS.map((r) => [r.id, r]));
// Kategorie intencji (pokoje z categories: true). Zapis jako prefiks „[Kategoria] ” w polu text —
// reguły Firestore pozostają bez zmian (dozwolone pola: text/kind), a antena /BCM24 odczytuje kategorię z prefiksu.
const PRAYER_CATEGORIES = [
  { id: 'Intencja', icon: '🙏' },
  { id: 'Prośba', icon: '🕊️' },
  { id: 'Podziękowanie', icon: '💛' },
  { id: 'Życzenia', icon: '🎉' },
  { id: 'Świadectwo', icon: '✨' }
];
const CATEGORY_RE = /^\[(Intencja|Prośba|Podziękowanie|Życzenia|Świadectwo)\]\s*/;
function splitCategory(text) {
  const s = String(text || '');
  const m = s.match(CATEGORY_RE);
  if (!m) return { cat: null, body: s };
  return { cat: PRAYER_CATEGORIES.find((c) => c.id === m[1]) || null, body: s.slice(m[0].length) };
}
const PRESENTER = {
  noemi: { id: 'noemi', name: 'Noemi', avatar: '/avatar_noemi.jpg?v=20261019c' },
  sara: { id: 'sara', name: 'Sara', avatar: '/avatar_sara.jpg?v=20261019c' },
  both: { id: 'cctv24', name: 'Noemi i Sara', avatar: '/logo_cctv.webp' },
  scripture: { id: 'cctv24', name: 'Pismo Święte', avatar: '/logo_cctv.webp' }
};

// ── Pomocnicze ────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
function el(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : String(v));
  }
  kids.flat().forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
  return e;
}
const hhmm = (ms) => new Date(ms).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw' });
const tsMs = (v) => (v && typeof v.toMillis === 'function') ? v.toMillis() : (v && v.seconds ? v.seconds * 1000 : (typeof v === 'number' ? v : 0));

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src; s.dataset.src = src; s.onload = resolve; s.onerror = resolve;
    document.head.appendChild(s);
  });
}

async function firebaseReady() {
  for (let i = 0; i < 100 && !getApps().length; i++) await new Promise((r) => setTimeout(r, 150));
  if (!getApps().length) return null;
  const app = getApp();
  return { db: getFirestore(app), auth: getAuth(app) };
}

// ── Dzisiejsza sesja Noemi i Sary (09:00 czasu polskiego) ────────────────────
const session = { day: '', title: '', items: [], liveStart: 0, total: 0, ready: false };
function warsawDay(ms = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
// Czas sesji dla czatu i pokoju: w trakcie emisji — sesja na żywo; między sesjami — ostatnia zakończona sesja dzisiaj (dzięki czemu treść nie znika).
function getChatLiveStart(D, now = Date.now()) {
  if (D && typeof D.chatSessionStart === 'function') return D.chatSessionStart(now);
  return D ? D.liveStartToday() : 0;
}
// Przesuwa oś czasu prowadzących na właściwą sesję (09:00 → 10:00 → 11:00 → między sesjami), bez ponownego pobierania scenariusza.
function shiftSession(D, now = Date.now()) {
  const start = getChatLiveStart(D, now);
  if (start === session.liveStart || !session.tl) return;
  session.liveStart = start;
  session.items = session.tl.map((e, i) => ({
    i, kind: e.m.kind, text: e.m.text, section: e.m.section,
    typingAt: start + e.typingAt, at: start + e.showAt
  }));
}
async function loadSession() {
  const day = warsawDay();
  if (session.ready && session.day === day) {
    if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
    return session;
  }
  await loadScript('/js/cc-tv-dialogue.js?v=20261019_tv7_a007d');
  const D = window.CCTvDialogue;
  if (!D) return session;
  try {
    const res = await fetch('/rozwazania_baza.json?d=' + day, { cache: 'no-cache' });
    const list = await res.json();
    const r = (Array.isArray(list) ? list : []).find((x) => x && x.date === day);
    // Wersja 4 (scenariusz TV z Noemi i Sarą) ma pierwszeństwo; zwykły tekst bez dialogu nie uruchamia sesji.
    const text = r ? (r.tvScript || r.scenariuszTV || r.wersjaTV || r.wersja4 || r.fullText || r.contentWeb || r.content || '') : '';
    const parsed = D.parse(text);
    const reduce = false;
    const tl = parsed.isDialogue ? D.timeline(parsed.messages, reduce) : [];
    session.day = day;
    session.title = r ? String(r.title || '') : '';
    session.tl = tl;
    session.liveStart = getChatLiveStart(D);
    session.items = tl.map((e, i) => ({
      i, kind: e.m.kind, text: e.m.text, section: e.m.section,
      typingAt: session.liveStart + e.typingAt, at: session.liveStart + e.showAt
    }));
    session.total = tl.length ? tl[tl.length - 1].endAt : 0;
    session.ready = true;
  } catch (_) { session.day = day; session.items = []; session.ready = true; }
  return session;
}
function presenterMessages(now = Date.now()) {
  return session.items.filter((m) => m.at <= now).map((m) => {
    const p = PRESENTER[m.kind] || PRESENTER.both;
    return { id: `cctv-${session.day}-${m.i}`, virtual: true, kind: m.kind, senderId: p.id, senderName: p.name, senderAvatar: p.avatar, text: m.text, at: m.at };
  });
}
function typingNow(now = Date.now()) {
  const m = session.items.find((x) => x.typingAt <= now && now < x.at);
  return m ? (PRESENTER[m.kind] || PRESENTER.both).name : '';
}
const sessionLive = (now = Date.now()) => session.total > 0 && now >= session.liveStart && now < session.liveStart + session.total;
// Object identity prevents UGC names/badges from impersonating a TV navigation target.
const publicPresenterMessages = new WeakSet();
const publicMessageRoom = (message) => publicPresenterMessages.has(message) ? 'tv_cctv24' : null;

// ── Czat ogólny: rozmowa prowadzących pojawia się także tutaj ────────────────
function getPresenterMessages(now = Date.now()) {
  return presenterMessages(now).map((m) => {
    const message = {
      id: m.id,
      virtual: true,
      senderId: m.senderId,
      senderName: m.senderName,
      senderAvatar: m.senderAvatar,
      senderBadge: (sessionLive(now) ? '🔴 NA ŻYWO · CCTV24' : '📺 Rozważanie · CCTV24'),
      text: m.text,
      type: 'text',
      timestamp: { seconds: Math.floor(m.at / 1000) },
      createdAt: m.at,
      reactions: {}
    };
    publicPresenterMessages.add(message);
    return message;
  });
}

function hookPublicChat() {
  if (window._lumiLiveRoomsPublicHooked) return;
  window._lumiLiveRoomsPublicHooked = true;
  if (typeof window.renderPublicChatMessages === 'function') {
    const original = window.renderPublicChatMessages;
    window.renderPublicChatMessages = function (messages) {
      let merged = messages || [];
      try {
        if (!merged.some((m) => m && (m.virtual || publicPresenterMessages.has(m)))) {
          const v = getPresenterMessages();
          if (v.length) {
            merged = merged.concat(v).sort((a, b) => (tsMs(a.timestamp) || a.createdAt || 0) - (tsMs(b.timestamp) || b.createdAt || 0));
          }
        }
      } catch (_) {}
      return original.call(this, merged);
    };
  }
  let shown = -1;
  const refreshPublic = () => {
    if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
    const n = presenterMessages().length;
    const box = document.getElementById('publicChatMessagesBox');
    const missingInDom = n > 0 && box && !box.querySelector('.lumina-msg-row[data-message-id^="cctv-"]');
    if (n !== shown || missingInDom) {
      shown = n;
      try {
        if (typeof window.renderPublicChatMessages === 'function') {
          window.renderPublicChatMessages(window._cachedPublicChatMessages || []);
        }
      } catch (_) {}
    }
  };
  setInterval(refreshPublic, 1500);
}

// ── Zakładka LIVE TV ─────────────────────────────────────────────────────────
const state = { fb: null, room: null, unsub: null, stopRoomAuth: null, memberRoomDenied: false, docs: [], tick: null, renderedSig: '' };

function styleTab(btn, active) {
  if (!btn) return;
  btn.style.background = active ? 'linear-gradient(135deg,#ef4444,#f59e0b)' : 'transparent';
  btn.style.color = active ? '#fff' : '#94a3b8';
  btn.style.boxShadow = active ? '0 2px 8px rgba(239,68,68,0.35)' : 'none';
}

function injectUi() {
  const privBtn = $('tabBtnPrivateChat');
  const pubView = $('messengerPublicView');
  if (!privBtn || !pubView || $('tabBtnLiveTv')) return !!$('tabBtnLiveTv');
  const btn = el('button', {
    type: 'button', id: 'tabBtnLiveTv', 'aria-label': 'Pokoje LIVE TV',
    style: 'position:relative; flex:1; min-height:44px; min-width:44px; padding:0; border-radius:10px; border:none; background:transparent; color:#94a3b8; font-weight:800; font-family:inherit; font-size:0.8rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:0; transition:all 0.2s; touch-action:manipulation;',
    onclick: () => window.switchMessengerMainTab('livetv')
  }, el('span', { 'aria-hidden': 'true', text: '📺' }));
  privBtn.insertAdjacentElement('afterend', btn);

  const view = el('div', { id: 'messengerLiveView', style: 'display:none; flex-direction:column; flex:1; min-height:0;' });
  pubView.insertAdjacentElement('afterend', view);

  const settingsBtn = $('btnChatSettingsModal');
  if (settingsBtn && !$('btnChatHeaderMore')) {
    const moreLabel = prayerEn ? 'More options (Radio and rooms)' : 'Więcej opcji (Radio i pokoje)';
    const moreBtn = el('button', {
      type: 'button',
      id: 'btnChatHeaderMore',
      class: 'chat-header-more-btn',
      'aria-expanded': 'false',
      'aria-label': moreLabel,
      title: moreLabel,
      onclick: (e) => {
        e.stopPropagation();
        const modal = $('directMessagesModal');
        if (!modal) return;
        const nextOpen = modal.getAttribute('data-lumi-more-open') !== 'true';
        if (nextOpen) modal.setAttribute('data-lumi-more-open', 'true');
        else modal.removeAttribute('data-lumi-more-open');
        moreBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      }
    }, el('i', { class: 'fa-solid fa-ellipsis-vertical', 'aria-hidden': 'true' }));
    settingsBtn.insertAdjacentElement('afterend', moreBtn);
  }

  const css = el('style', { id: 'lumiLiveRoomsCss' });
  css.textContent = `
    body.user-is-guest #directMessagesModal.open[data-lumi-live-room]{display:flex!important;pointer-events:auto!important;opacity:1!important;visibility:visible!important}
    #messengerLiveView .llr-list{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px;background:rgba(0,0,0,.2)}
    #messengerLiveView .llr-card{display:flex;gap:12px;align-items:center;width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);color:#fff;font:inherit;cursor:pointer;min-height:64px}
    #messengerLiveView .llr-room-logo{object-fit:cover;border-radius:50%;flex:0 0 auto}
    #messengerLiveView .llr-card:hover,#messengerLiveView .llr-card:focus-visible{border-color:#f59e0b;outline:none}
    #messengerLiveView .llr-ico{font-size:1.6rem;width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(239,68,68,.15);flex-shrink:0}
    #messengerLiveView .llr-name{font-weight:800}#messengerLiveView .llr-desc{font-size:.75rem;color:#cbd5e1}
    #messengerLiveView .llr-live{display:inline-flex;align-items:center;gap:6px;font-size:.7rem;font-weight:800;color:#fecaca;background:rgba(239,68,68,.2);padding:2px 8px;border-radius:999px;margin-left:6px}
    #messengerLiveView .llr-live::before{content:'';width:7px;height:7px;border-radius:50%;background:#ef4444}
    #messengerLiveView .llr-head{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid rgba(255,255,255,.08)}
    #messengerLiveView .llr-head button,#messengerLiveView .llr-head a{min-height:44px;min-width:44px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:transparent;color:#e2e8f0;font:inherit;font-size:.8rem;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0 10px;text-decoration:none}
    #messengerLiveView .llr-title{flex:1;font-weight:800;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #messengerLiveView .llr-box{flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:8px;background:rgba(0,0,0,.2)}
    #messengerLiveView .llr-msg{display:flex;gap:8px;align-items:flex-end}
    #messengerLiveView .llr-msg.me{flex-direction:row-reverse}
    #messengerLiveView .llr-msg img{width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,.25)}
    #messengerLiveView .llr-b{max-width:86%;padding:9px 13px;border-radius:16px 16px 16px 4px;background:rgba(255,255,255,.07);color:#fff;font-size:.86rem;line-height:1.45;white-space:pre-wrap;word-break:break-word;overflow:hidden}
    #messengerLiveView .llr-msg.me .llr-b{border-radius:16px 16px 4px 16px;background:linear-gradient(135deg,#a855f7,#06b6d4)}
    #messengerLiveView .llr-msg.host .llr-b{background:rgba(212,175,55,.16);border:1px solid rgba(212,175,55,.4)}
    #messengerLiveView .llr-msg.prayer .llr-b{border:1px solid rgba(252,211,77,.55)}
    #messengerLiveView .llr-meta{display:flex;justify-content:space-between;gap:8px;font-size:.66rem;color:rgba(255,255,255,.65);margin-top:4px}
    #messengerLiveView .llr-who{font-weight:800;font-size:.74rem;color:#f9a8d4;margin-bottom:2px}
    #messengerLiveView .llr-msg.host .llr-who{color:#fcd34d}
    #messengerLiveView .llr-del{background:none;border:none;color:#fca5a5;font:inherit;font-size:.66rem;cursor:pointer;min-height:32px}
    #messengerLiveView .llr-live-bar{margin:8px -13px -9px -13px;padding:6px 10px;background:linear-gradient(90deg,#dc2626,#991b1b);color:#ffffff;font-size:.72rem;font-weight:700;line-height:1.35;white-space:normal;word-break:normal;display:flex;align-items:center;gap:6px;border-top:1px solid rgba(255,255,255,.2);box-shadow:0 -1px 4px rgba(0,0,0,.15);letter-spacing:.1px;border-bottom-left-radius:inherit;border-bottom-right-radius:inherit}
    #messengerLiveView .llr-live-dot{width:7px;height:7px;border-radius:50%;background:#ffffff;box-shadow:0 0 6px rgba(255,255,255,.9);flex-shrink:0;display:inline-block;animation:llrPulse 1.8s infinite ease-in-out}

    #directMessagesModal:not([data-lumi-live-room="prayer_40dm"]) #btnChatHeaderMore{display:none!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"]{--prayer-surface:#11271e;--prayer-panel:#1c392d;--prayer-accent:#e5c684;--prayer-text:#f6f4e8}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.modal-card,.lumina-messenger-modal-card,.cc-chat-header,#messengerLiveView){background:var(--prayer-surface)!important;color:var(--prayer-text)!important;border-color:rgba(229,198,132,.3)!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.chat-header-bar,.cc-chat-header){background:linear-gradient(180deg,#0d2219 0%,#11271e 100%)!important;border-bottom:1px solid rgba(229,198,132,.26)!important;color:var(--prayer-text)!important;padding:10px 14px!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .chat-header-logo-icon{background:linear-gradient(145deg,#1c392d,#11271e)!important;border:1px solid rgba(229,198,132,.45)!important;color:var(--prayer-accent)!important;box-shadow:none!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(#btnChatSettingsModal,#btnChatHeaderMore){display:inline-flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;max-width:44px!important;max-height:44px!important;border-radius:12px!important;border:1px solid rgba(229,198,132,.45)!important;background:#183327!important;color:var(--prayer-accent)!important;font-size:1.05rem!important;cursor:pointer!important;padding:0!important;margin:0!important;flex:0 0 44px!important;transition:all .2s}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] #btnChatHeaderMore[aria-expanded="true"]{background:#284d3c!important;border-color:var(--prayer-accent)!important;color:#fff!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .cc-chat-radio{background:#163024!important;border:1px solid rgba(229,198,132,.38)!important;color:var(--prayer-text)!important;border-radius:14px!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .cc-chat-radio select,html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .cc-chat-radio select option{background:#163024!important;color:var(--prayer-text)!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .cc-chat-radio button{background:linear-gradient(135deg,#e5c684,#c4a35a)!important;color:#112218!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .lumi-room-navigation{background:#152e23!important;border:1px solid rgba(229,198,132,.25)!important;border-radius:14px!important;padding:4px!important;margin-top:8px!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .lumi-room-navigation>button{background:transparent!important;color:#bdcac1!important;box-shadow:none!important;border-radius:10px!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] .lumi-room-navigation>button:hover,html body #directMessagesModal[data-lumi-live-room="prayer_40dm"] #tabBtnLiveTv{background:#234636!important;color:var(--prayer-accent)!important;box-shadow:none!important}
    body.cc-mess-embedded #directMessagesModal[data-lumi-live-room="prayer_40dm"]{padding:0!important;height:100dvh!important;max-height:100dvh!important}
    body.cc-mess-embedded #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.modal-card,.lumina-messenger-modal-card){width:100%!important;max-width:100%!important;height:100dvh!important;min-height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:14px!important;display:flex!important;flex-direction:column!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] #messengerLiveView{flex:1 1 auto!important;min-height:0!important;height:100%!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] #llrBox{flex:1 1 auto!important;min-height:240px!important}
    body.cc-mess-embedded #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.chat-close-btn,.chat-fullscreen-btn){display:none!important}
    html body #directMessagesModal[data-lumi-live-room="prayer_40dm"]:not([data-lumi-more-open="true"]) :is(.cc-chat-radio,.lumi-room-navigation,.chat-header-bar>.lumi-room-navigation,#messengerLiveView .llr-head>.llr-nav-extra){display:none!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.llr-head,.llr-compose,.llr-box,.llr-host){border-color:#e5c68440;background:var(--prayer-surface)}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.llr-b,.llr-msg.me .llr-b,.llr-note){background:var(--prayer-panel);color:var(--prayer-text)}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] :is(.llr-title,.llr-who,.llr-head a,.llr-host a,.llr-host strong){color:var(--prayer-accent)}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-msg.me .llr-b{background:#315143;border:1px solid #e5c68460}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-send{background:#ff7a00;color:#172119}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host{margin:8px 12px;border:1px solid #e5c68455;padding:9px 10px;border-radius:12px;display:flex;align-items:flex-start;gap:10px;flex-shrink:0;position:relative;background:#163024!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host[hidden]{display:none!important}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host img{border-radius:50%;flex:none;object-fit:cover;border:1.5px solid var(--prayer-accent)}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host-body{flex:1;min-width:0}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host p{margin:3px 0;font-size:.78rem;line-height:1.35}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host a{display:inline-flex;align-items:center;min-height:44px;font-size:.8rem;font-weight:700}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host-close{min-width:44px;min-height:44px;width:44px;height:44px;border-radius:10px;border:1px solid rgba(229,198,132,.3);background:rgba(0,0,0,.2);color:var(--prayer-accent);font-size:1.2rem;line-height:1;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0;flex-shrink:0}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host-avatar-btn{position:relative;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;padding:0!important;border-radius:50%!important;border:1.5px solid var(--prayer-accent)!important;background:#183327!important;display:inline-flex!important;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host-avatar-btn img{width:36px;height:36px;border-radius:50%;object-fit:cover;display:block}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-host-dot{position:absolute;right:1px;bottom:1px;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #11271e}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-privacy-note{margin:6px 12px 0;transition:opacity .4s ease,transform .4s ease}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-privacy-note.is-fading-out{opacity:0;transform:translateY(-4px);pointer-events:none}
    #directMessagesModal[data-lumi-live-room="prayer_40dm"] .llr-privacy-note[hidden]{display:none!important}
    @keyframes llrPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.85)}}
    #messengerLiveView .llr-note{align-self:center;text-align:center;font-size:.75rem;color:#cbd5e1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);padding:8px 14px;border-radius:12px;max-width:92%}
    #messengerLiveView .llr-sec{align-self:center;font-size:.7rem;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#fcd34d;background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.35);padding:3px 12px;border-radius:999px}
    #messengerLiveView .llr-typing{font-size:.75rem;color:#fcd34d;padding:2px 16px 6px;min-height:18px}
    #messengerLiveView .llr-compose{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.08)}
    #messengerLiveView .llr-row{display:flex;gap:8px;align-items:flex-end}
    #messengerLiveView textarea{flex:1;min-height:44px;max-height:120px;resize:none;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;font:inherit;font-size:16px}
    #messengerLiveView .llr-send{min-width:48px;min-height:44px;border-radius:12px;border:none;background:linear-gradient(135deg,#ef4444,#f59e0b);color:#fff;font-weight:800;cursor:pointer}
    #messengerLiveView .llr-check{display:flex;gap:8px;align-items:center;font-size:.75rem;color:#fde68a}
    #messengerLiveView .llr-err{font-size:.75rem;color:#fca5a5}
    #messengerLiveView .llr-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
    #messengerLiveView .llr-cats::-webkit-scrollbar{display:none}
    #messengerLiveView .llr-cat{flex-shrink:0;min-height:44px;min-width:44px;padding:0 12px;border-radius:999px;border:1px solid rgba(226,204,154,.35);background:rgba(255,255,255,.05);color:#f1e4c6;font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
    #messengerLiveView .llr-cat[aria-pressed="true"]{background:linear-gradient(120deg,#e7cf9e,#c5a15f);color:#2f2825;border-color:#e7cf9e}
    #messengerLiveView .llr-tag{display:inline-block;margin-right:6px;font-size:.66rem;font-weight:800;letter-spacing:.4px;color:#2f2825;background:linear-gradient(120deg,#e7cf9e,#c5a15f);padding:1px 7px;border-radius:999px;vertical-align:1px}
  `;
  document.head.appendChild(css);
  return true;
}

function hookTabs() {
  if (window._lumiLiveTabsHooked || typeof window.switchMessengerMainTab !== 'function') return false;
  window._lumiLiveTabsHooked = true;
  const original = window.switchMessengerMainTab;
  window.switchMessengerMainTab = function (tab, preserve) {
    const view = $('messengerLiveView');
    if (tab === 'livetv') {
      original.call(this, 'public', preserve);
      const pub = $('messengerPublicView');
      if (pub) pub.style.display = 'none';
      styleTab($('tabBtnPublicChat'), false);
      styleTab($('tabBtnLiveTv'), true);
      if (view) view.style.display = 'flex';
      openLive();
      return;
    }
    if (view) view.style.display = 'none';
    $('directMessagesModal')?.removeAttribute('data-lumi-live-room');
    $('directMessagesModal')?.removeAttribute('data-lumi-more-open');
    $('btnChatHeaderMore')?.setAttribute('aria-expanded', 'false');
    styleTab($('tabBtnLiveTv'), false);
    leaveRoom();
    return original.apply(this, arguments);
  };
  return true;
}

function currentUser() {
  const u = state.fb && state.fb.auth.currentUser;
  return u && !u.isAnonymous ? u : null;
}
function isAdmin() {
  try { return !!(window.LuminaDB && window.LuminaDB.isLuminaMasterAdmin && window.LuminaDB.isLuminaMasterAdmin()); } catch (_) { return false; }
}

async function openLive() {
  if (!state.fb) state.fb = await firebaseReady();
  if (state.room?.memberOnly) { watchMemberRoom(state.room); return; }
  await loadSession();
  if (state.room) {
    if (state.room.memberOnly) watchMemberRoom(state.room);
    else { subscribeRoom(state.room); renderRoom(); }
  } else renderList();
}

function renderList() {
  const view = $('messengerLiveView');
  if (!view) return;
  const live = sessionLive();
  const list = el('div', { class: 'llr-list', role: 'list' },
    el('div', { class: 'llr-note', text: '📺 Pokoje LIVE TV — rozmawiaj z innymi podczas transmisji. Rozważanie Noemi i Sary codziennie o 9:00; powtórka o 18:00 czasu polskiego.' }),
    LIVE_ROOMS.map((r) => el('button', { type: 'button', class: 'llr-card', role: 'listitem', onclick: () => enterRoom(r.id) },
      r.logo ? el('img', { class: 'llr-room-logo', src:r.logo, width:36, height:36, alt:'' }) : el('span', { class: 'llr-ico', 'aria-hidden': 'true', text: r.icon }),
      el('span', {},
        el('span', { class: 'llr-name', text: r.name }), (live && r.reflection) ? el('span', { class: 'llr-live', text: 'NA ŻYWO' }) : null,
        el('br'), el('span', { class: 'llr-desc', text: r.desc })))));
  view.replaceChildren(list);
}

function leaveRoom() {
  state.stopRoomAuth?.();
  state.stopRoomAuth = null;
  if (state.unsub) { try { state.unsub(); } catch (_) {} }
  if (state.tick) clearInterval(state.tick);
  state.unsub = null; state.tick = null; state.room = null; state.docs = []; state.renderedSig = ''; state.memberRoomDenied = false;
}

function enterRoom(roomId) {
  leaveRoom();
  const r = ROOM[roomId];
  if (!r) return;
  state.room = r;
  const view = $('messengerLiveView');
  const box = el('div', { class: 'llr-box', id: 'llrBox', role: 'log', 'aria-live': 'polite', 'aria-label': 'Wiadomości w pokoju ' + r.name });
  const typing = el('div', { class: 'llr-typing', id: 'llrTyping', 'aria-hidden': 'true' });
  const input = el('textarea', { id: 'llrInput', maxlength: '1000', rows: '1', placeholder: r.placeholder || (r.prayers ? 'Napisz modlitwę lub pozdrowienie…' : 'Napisz do widzów…'), 'aria-label': 'Wiadomość w pokoju ' + r.name });
  const err = el('div', { class: 'llr-err', role: 'alert' });
  const prayer = r.prayers ? el('input', { type: 'checkbox', id: 'llrPrayer', checked: true }) : null;
  let category = r.categories ? PRAYER_CATEGORIES[0].id : null;
  const cats = r.categories ? el('div', { class: 'llr-cats', role: 'group', 'aria-label': 'Rodzaj wiadomości' },
    PRAYER_CATEGORIES.map((c, i) => el('button', {
      type: 'button', class: 'llr-cat', 'aria-pressed': i === 0 ? 'true' : 'false', 'data-cat': c.id,
      onclick: (e) => {
        category = c.id;
        e.currentTarget.parentElement.querySelectorAll('.llr-cat').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === c.id ? 'true' : 'false'));
        input.focus();
      }
    }, el('span', { 'aria-hidden': 'true', text: c.icon }), c.id))) : null;
  const send = async () => {
    err.textContent = '';
    if (state.room !== r || (r.memberOnly && state.memberRoomDenied)) return;
    const user = currentUser();
    const raw = input.value.trim();
    if (!raw) return;
    const text = category ? `[${category}] ${raw}` : raw;
    if (!user) { err.textContent = 'Zaloguj się, aby pisać w pokoju LIVE.'; return; }
    if (!state.fb) { err.textContent = 'Brak połączenia — spróbuj za chwilę.'; return; }
    const prof = (window.LuminaDB && window.LuminaDB.getCurrentProfile && window.LuminaDB.getCurrentProfile()) || {};
    try {
      await addDoc(collection(state.fb.db, 'lumina_live_rooms', r.id, 'messages'), {
        roomId: r.id, text: text.slice(0, 1000), senderAuthUid: user.uid,
        senderName: String(prof.name || user.displayName || 'Uczestnik LUMINA').slice(0, 80),
        senderAvatar: String(prof.avatar || user.photoURL || '/lumina_icon.jpg').slice(0, 500),
        kind: prayer && prayer.checked ? 'prayer' : 'text', createdAt: serverTimestamp()
      });
      input.value = '';
    } catch (e) { err.textContent = 'Nie udało się wysłać. Sprawdź, czy jesteś zalogowany.'; }
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  let hostCard = null;
  let hostAvatarBtn = null;
  if (r.memberOnly) {
    hostCard = el('section', { class: 'llr-host', id: 'llrHostCard', 'aria-label': prayerCopy.host, hidden: true },
      el('img', { src: '/images/chat/assistants/asystentka-1.webp', width: 38, height: 38, loading: 'lazy', alt: '' }),
      el('div', { class: 'llr-host-body' },
        el('strong', { text: prayerCopy.host }),
        el('p', { text: prayerCopy.welcome }),
        el('a', { href: '/mess?assistant=cc&asst=asystentka-1&source=40dm&topic=40dm', target: '_blank', rel: 'noopener', text: prayerCopy.help + ' ↗' })
      ),
      el('button', {
        type: 'button',
        id: 'llrHostCloseBtn',
        class: 'llr-host-close',
        'aria-label': prayerEn ? 'Close host card' : 'Zamknij wizytówkę gospodyni',
        title: prayerEn ? 'Close' : 'Zamknij',
        onclick: () => {
          hostCard.hidden = true;
          hostAvatarBtn?.setAttribute('aria-expanded', 'false');
        },
        text: '×'
      })
    );
    hostAvatarBtn = el('button', {
      type: 'button',
      id: 'llrHostAvatarBtn',
      class: 'llr-host-avatar-btn',
      'aria-expanded': 'false',
      'aria-controls': 'llrHostCard',
      'aria-label': prayerCopy.host,
      title: prayerCopy.host,
      onclick: () => {
        const nextOpen = hostCard.hidden;
        hostCard.hidden = !nextOpen;
        hostAvatarBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      }
    },
      el('img', { src: '/images/chat/assistants/asystentka-1.webp', width: 36, height: 36, alt: '' }),
      el('span', { class: 'llr-host-dot', 'aria-hidden': 'true' })
    );
  }
  const privacyNote = r.memberOnly ? el('p', { class: 'llr-note llr-privacy-note', text: prayerCopy.privacy }) : null;
  if (privacyNote) {
    setTimeout(() => {
      privacyNote.classList.add('is-fading-out');
      setTimeout(() => { privacyNote.hidden = true; }, 450);
    }, 4500);
  }
  view.replaceChildren(
    el('div', { class: 'llr-head' },
      el('button', { type: 'button', class: 'llr-nav-extra', 'aria-label': r.memberOnly ? prayerCopy.back : 'Wróć do listy pokoi', onclick: () => { $('directMessagesModal')?.removeAttribute('data-lumi-live-room'); leaveRoom(); renderList(); }, text: '←' }),
      r.logo ? el('img', { class: 'llr-room-logo', src:r.logo, width:36, height:36, alt:'' }) : null,
      el('span', { class: 'llr-title', text: r.logo ? r.name : r.icon + ' ' + r.name }),
      el('a', { class: 'llr-nav-extra', href: r.url, target: '_blank', rel: 'noopener', text: r.memberOnly ? prayerCopy.plan + ' ↗' : 'Oglądaj ↗', 'aria-label': r.memberOnly ? prayerCopy.plan : 'Otwórz transmisję ' + r.name }),
      hostAvatarBtn),
    hostCard,
    privacyNote,
    box, typing,
    el('div', { class: 'llr-compose' },
      prayer ? el('label', { class: 'llr-check', for: 'llrPrayer' }, prayer, el('span', { text: r.prayerLabel || '🙏 To modlitwa — pokaż ją na antenie „Zjednoczeni za Polskę”' })) : null,
      cats,
      el('div', { class: 'llr-row' }, input, el('button', { type: 'button', class: 'llr-send', 'aria-label': r.memberOnly ? prayerCopy.send : 'Wyślij', onclick: send, text: '➤' })),
      err));

  if (r.memberOnly) watchMemberRoom(r);
  else subscribeRoom(r);
  state.tick = setInterval(() => renderRoom(false), 1000);
  renderRoom(true);
}

function watchMemberRoom(r) {
  if (!state.fb || state.stopRoomAuth || state.room !== r) return;
  state.stopRoomAuth = onAuthStateChanged(state.fb.auth, () => {
    if (state.room !== r) return;
    state.unsub?.();
    state.unsub = null;
    state.docs = [];
    state.memberRoomDenied = false;
    $('llrInput').value = '';
    subscribeRoom(r);
    renderRoom(true);
  });
}

function subscribeRoom(r) {
  if (r.memberOnly && !currentUser()) return;
  if (state.fb && state.room === r && !state.unsub) {
    const q = query(collection(state.fb.db, 'lumina_live_rooms', r.id, 'messages'), orderBy('createdAt', 'desc'), limit(80));
    const memberUid = r.memberOnly ? currentUser().uid : null;
    const receive = (snap) => {
      if (state.room !== r || (memberUid && (currentUser()?.uid !== memberUid || snap.metadata.fromCache))) return;
      const docs = [];
      snap.forEach((d) => docs.push({ id: d.id, ...d.data() }));
      state.docs = docs;
      renderRoom(true);
    };
    const reject = () => {
      if (state.room !== r || (memberUid && currentUser()?.uid !== memberUid)) return;
      if (memberUid) { state.docs = []; state.memberRoomDenied = true; }
      renderRoom(true);
    };
    state.unsub = memberUid ? onSnapshot(q, { includeMetadataChanges: true }, receive, reject) : onSnapshot(q, receive, reject);
  }
}

function renderRoom(force) {
  const r = state.room;
  const box = $('llrBox');
  if (!r || !box) return;
  if (r.memberOnly) {
    const allowed = !!currentUser() && !state.memberRoomDenied;
    $('llrInput').disabled = !allowed;
    const send = box.parentElement.querySelector('.llr-send');
    if (send) send.disabled = !allowed;
    if (!allowed) {
      if (force || !box.firstChild) box.replaceChildren(el('p', {class:'llr-note', text: state.memberRoomDenied ? prayerCopy.denied : prayerCopy.guest}));
      return;
    }
  }
  if (window.CCTvDialogue) shiftSession(window.CCTvDialogue);
  const now = Date.now();
  const hosts = r.reflection ? presenterMessages(now) : [];
  const typingName = r.reflection ? typingNow(now) : '';
  const t = $('llrTyping');
  if (t) t.textContent = typingName ? `${typingName} pisze…` : '';
  const isLive = sessionLive(now);
  const sig = hosts.length + ':' + (isLive ? 'L' : 'R') + ':' + state.docs.map((d) => d.id + (d.createdAt ? 1 : 0)).join(',') + ':' + (now < session.liveStart ? Math.floor((session.liveStart - now) / 60000) : 'x');
  if (!force && sig === state.renderedSig) return;
  state.renderedSig = sig;
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 160;

  const me = currentUser();
  const admin = isAdmin();
  const userMsgs = state.docs.map((d) => ({ ...d, at: tsMs(d.createdAt) || now }));
  const all = hosts.concat(userMsgs).sort((a, b) => a.at - b.at);
  const nodes = [];
  if (r.reflection && session.items.length) {
    if (now < session.liveStart) {
      const mins = Math.ceil((session.liveStart - now) / 60000);
      nodes.push(el('div', { class: 'llr-note', text: `🔴 Dziś o 9:00 Noemi i Sara rozpoczną tu rozważanie na żywo${session.title ? ': „' + session.title + '”' : ''}. Start za ${mins >= 60 ? Math.floor(mins / 60) + ' h ' + (mins % 60) + ' min' : mins + ' min'}.` }));
    } else if (isLive) {
      nodes.push(el('div', { class: 'llr-note', text: `🔴 NA ŻYWO: rozważanie${session.title ? ' „' + session.title + '”' : ''}. Pisz śmiało — prowadzące i widzowie są z Tobą.` }));
    } else {
      const nextStart = window.CCTvDialogue && window.CCTvDialogue.todaySessionStarts ? window.CCTvDialogue.todaySessionStarts(now).find((s) => s > now) : null;
      const nextInfo = nextStart ? `Kolejna transmisja na żywo o ${hhmm(nextStart)}.` : 'Kolejne rozważanie na żywo jutro o 9:00.';
      nodes.push(el('div', { class: 'llr-note', text: `📺 Rozważanie Noemi i Sary${session.title ? ': „' + session.title + '”' : ''}. ${nextInfo} Pisz śmiało i dołącz z modlitwą!` }));
    }
  } else if (r.reflection) {
    nodes.push(el('div', { class: 'llr-note', text: 'Codziennie o 9:00 Noemi i Sara prowadzą tu rozważanie na żywo.' }));
  }
  if (r.prayers) nodes.push(el('div', { class: 'llr-note', text: r.prayerNote || '🙏 Modlitwy z tego pokoju pojawiają się na antenie /zapolske-live po kilku sekundach. Treści z linkami lub wulgaryzmami nie trafiają na antenę.' }));
  let lastSec = null;
  all.forEach((m) => {
    if (m.virtual) {
      const sec = session.items[Number(m.id.split('-').pop())]?.section;
      if (sec && sec !== lastSec) { lastSec = sec; nodes.push(el('div', { class: 'llr-sec', text: sec.replace(/\s*:\s*/, ' · ') })); }
    }
    const mine = !m.virtual && me && m.senderAuthUid === me.uid;
    const img = el('img', { src: m.senderAvatar || '/lumina_icon.jpg', alt: '', loading: 'lazy' });
    img.onerror = () => { img.onerror = null; img.src = '/lumina_icon.jpg'; };
    const del = (!m.virtual && (mine || admin)) ? el('button', { type: 'button', class: 'llr-del', text: 'Usuń', 'aria-label': 'Usuń wiadomość', onclick: async () => {
      try { await deleteDoc(doc(state.fb.db, 'lumina_live_rooms', r.id, 'messages', m.id)); } catch (_) {}
    } }) : null;
    const liveBar = (!r.memberOnly && !m.virtual && (!r.categories || m.kind === 'prayer')) ? el('div', { class: 'llr-live-bar', role: 'status', 'aria-label': 'Potwierdzenie nadania w programie na żywo' },
      el('span', { class: 'llr-live-dot', 'aria-hidden': 'true' }),
      el('span', { class: 'llr-live-text', text: r.liveBarText || 'Twoja wiadomość została opublikowana w programie na żywo CCTV LIVE 24.' })
    ) : null;
    const parts = m.virtual ? { cat: null, body: m.text || '' } : splitCategory(m.text);
    nodes.push(el('div', { class: 'llr-msg' + (mine ? ' me' : '') + (m.virtual ? ' host' : '') + (m.kind === 'prayer' ? ' prayer' : '') },
      img,
      el('div', { class: 'llr-b' },
        el('div', { class: 'llr-who', text: (m.virtual ? '🎙️ ' : (m.kind === 'prayer' ? '🙏 ' : '')) + (mine ? 'Ty' : (m.senderName || 'Uczestnik')) }),
        el('div', {}, parts.cat ? el('span', { class: 'llr-tag', text: parts.cat.icon + ' ' + parts.cat.id }) : null, parts.body),
        el('div', { class: 'llr-meta' }, el('span', { text: hhmm(m.at) }), del),
        liveBar)));
  });
  if (!all.length && !(r.reflection && session.items.length && now < session.liveStart)) nodes.push(el('div', { class: 'llr-note', text: r.memberOnly ? prayerCopy.empty : 'Bądź pierwszy — przywitaj się z widzami! 👋' }));
  box.replaceChildren(...nodes);
  if (force || nearBottom) box.scrollTop = box.scrollHeight;
}

// Open the canonical room and its modal together, including anonymous visitors.
// Selecting a room alone leaves its composer inside a hidden modal.
function openRoom(roomId) {
  if (!ROOM[roomId] || !injectUi()) return false;
  if (!window._lumiLiveTabsHooked && !hookTabs()) return false;
  const modal = $('directMessagesModal');
  if (!modal) return false;
  modal.removeAttribute('inert');
  modal.setAttribute('aria-hidden', 'false');
  modal.style.display = 'flex';
  modal.classList.add('open');
  modal.setAttribute('data-lumi-live-room', roomId);
  modal.removeAttribute('data-lumi-more-open');
  $('btnChatHeaderMore')?.setAttribute('aria-expanded', 'false');
  const intro = $('lumiIntroOverlay');
  if (intro) intro.hidden = true;
  try { $('lumiIntroVideo')?.pause(); } catch (_) {}
  window.switchMessengerMainTab('livetv');
  enterRoom(roomId);
  return true;
}

function openRequestedRoom() {
  const want = new URLSearchParams(location.search).get('room');
  if (!ROOM[want]) return;
  if (openRoom(want)) return;
  const wait = setInterval(() => {
    if (openRoom(want)) clearInterval(wait);
  }, 250);
  setTimeout(() => clearInterval(wait), 15000);
}

// ── Start ────────────────────────────────────────────────────────────────────
async function boot() {
  for (let i = 0; i < 80; i++) {
    const ok = injectUi() && hookTabs();
    if (ok) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  hookPublicChat();
  // Routing must not wait for the unrelated daily reflection download.
  openRequestedRoom();
  await loadSession();
  try { window.renderPublicChatMessages && window._cachedPublicChatMessages && window.renderPublicChatMessages(window._cachedPublicChatMessages); } catch (_) {}
  // Co 30 s: nowa doba → nowy scenariusz; kolejna sesja tego dnia (np. 11:00) → przesunięcie osi czasu.
  setInterval(() => { if (warsawDay() !== session.day) session.ready = false; loadSession(); }, 30000);
}

window.LumiLiveRooms = { LIVE_ROOMS, PRAYER_CATEGORIES, publicMessageRoom, enterRoom: openRoom, session: () => session, getPresenterMessages };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
