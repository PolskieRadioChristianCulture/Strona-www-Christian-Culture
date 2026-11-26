/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE — Wspólny Komponent Informacyjny: Infolinia NADZIEJA
 * Plik: /components/cc-infolinia-nadzieja-modal.js
 *
 * - Jeden wspólny komponent dla całego ekosystemu Christian Culture.
 * - Przechwytuje kliknięcia w przyciski / linki połączeń z Infolinią NADZIEJA
 *   (+48 730 958 583, tel: / WhatsApp / #helplineFloat / [data-infolinia-nadzieja])
 *   w fazie capture, zanim zostanie uruchomione połączenie.
 * - Wymaga obowiązkowego potwierdzenia zapoznania się z komunikatem przed
 *   przejściem do połączenia.
 * - Nie przechwytuje numerów alarmowych (112, 800*, 801*) ani innych służb.
 * - Pełna dostępność WCAG 2.2 AA: role="dialog", aria-modal="true", focus trap,
 *   inert dla tła, aria-live="polite", obsługa klawiatury i wysokie kontrasty.
 * - 100% DOM API (createElement + textContent).
 * ══════════════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  if (window.CCInfoliniaNadzieja && window.CCInfoliniaNadzieja.__initialized) return;

  const PHONE_DIGITS = '730958583';
  const PHONE_E164 = '+48730958583';
  const PHONE_DISPLAY = '+48 730 958 583';
  const YT_VIDEO_ID = '3HBUoJDujVY';
  const YT_WATCH_URL = 'https://youtu.be/3HBUoJDujVY';
  const YT_EMBED_URL = 'https://www.youtube-nocookie.com/embed/3HBUoJDujVY?autoplay=1&rel=0';
  const YT_THUMB_URL = 'https://i.ytimg.com/vi/3HBUoJDujVY/hqdefault.jpg';
  const STYLE_ID = 'cc-infolinia-nadzieja-styles';
  const MODAL_ID = 'ccInfoliniaNadziejaOverlay';

  function trackInfolinia(eventName, extra) {
    const payload = Object.assign({ page_path: location.pathname }, extra || {});
    try {
      if (typeof window.ccTrack === 'function') {
        window.ccTrack(eventName, payload);
        return;
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, Object.assign({ transport_type: 'beacon' }, payload));
      }
    } catch (e) {}
  }

  let overlayEl = null;
  let dialogEl = null;
  let titleEl = null;
  let ackCheckbox = null;
  let proceedBtn = null;
  let backBtn = null;
  let closeBtn = null;
  let copyBtn = null;
  let liveRegion = null;
  let modeBadgeEl = null;
  let videoTriggerBtn = null;
  let videoPlayerWrap = null;
  let videoStageEl = null;

  let pendingAction = null; // { href, isExternal, label }
  let lastTriggerEl = null;
  let inertSnapshots = [];
  let prevBodyOverflow = '';

  function normalizeDigits(str) {
    return String(str || '').replace(/[^\d]/g, '');
  }

  function isNadziejaTrigger(node) {
    if (!node || typeof node.closest !== 'function') return null;

    // Nigdy nie przechwytuj potwierdzonego przycisku wewnątrz samego okna
    if (node.closest('[data-cc-infolinia-confirmed="true"]')) return null;

    const el = node.closest(
      'a[href], button[data-infolinia-nadzieja], [data-infolinia-nadzieja], #helplineFloat, #shortcutHelpline, #drawerHelpline'
    );
    if (!el) return null;

    // Wyklucz elementy wewnątrz modalu (np. link „zadzwoń pod numer alarmowy 112” jeśli miałby href)
    if (overlayEl && overlayEl.contains(el)) return null;

    const explicitOptOut = el.getAttribute('data-infolinia-bypass');
    if (explicitOptOut === 'true') return null;

    const href = (el.getAttribute('href') || '').trim();
    const digits = normalizeDigits(href);

    // Bezpośrednia detekcja tel:+48730958583 lub wa.me/48730958583
    if (/^tel:/i.test(href)) {
      if (digits.endsWith(PHONE_DIGITS)) {
        return {
          el,
          href,
          isExternal: false,
          kind: 'tel'
        };
      }
      return null;
    }

    if (/wa\.me|whatsapp\.com/i.test(href) && digits.endsWith(PHONE_DIGITS)) {
      return {
        el,
        href,
        isExternal: true,
        kind: 'whatsapp'
      };
    }

    if (el.hasAttribute('data-infolinia-nadzieja') || el.id === 'helplineFloat' || el.id === 'shortcutHelpline' || el.id === 'drawerHelpline') {
      return {
        el,
        href: href && !href.startsWith('#') ? href : `tel:${PHONE_E164}`,
        isExternal: /^https?:\/\//i.test(href),
        kind: /wa\.me|whatsapp/i.test(href) ? 'whatsapp' : 'tel'
      };
    }

    return null;
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      `#${MODAL_ID}[hidden]{display:none !important;}`,
      `#${MODAL_ID}{`,
      '  position:fixed;inset:0;z-index:2147483000;',
      '  display:flex;align-items:center;justify-content:center;',
      '  padding:16px;',
      '  background:rgba(4,7,15,0.84);',
      '  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      '  font-family:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;',
      '  box-sizing:border-box;',
      '}',
      `#${MODAL_ID} *, #${MODAL_ID} *::before, #${MODAL_ID} *::after{box-sizing:border-box;}`,
      `#${MODAL_ID} .ccin-dialog{`,
      '  position:relative;width:100%;max-width:640px;max-height:94dvh;overflow-y:auto;',
      '  background:linear-gradient(165deg,#10172b 0%,#080d1a 100%);',
      '  color:#F8FAFC;border:1.5px solid rgba(196,163,90,0.48);',
      '  border-radius:24px;padding:clamp(18px,3vw,26px);',
      '  box-shadow:0 28px 72px rgba(0,0,0,0.82),0 0 0 1px rgba(255,255,255,0.05) inset;',
      '  text-align:left;line-height:1.5;',
      '}',
      `#${MODAL_ID} .ccin-close{`,
      '  position:sticky;top:0;float:right;z-index:2;',
      '  min-width:44px;min-height:44px;width:44px;height:44px;',
      '  border-radius:999px;border:1px solid rgba(255,255,255,0.22);',
      '  background:rgba(15,23,42,0.92);color:#FFFFFF;',
      '  font-size:18px;font-weight:700;cursor:pointer;',
      '  display:inline-flex;align-items:center;justify-content:center;',
      '  transition:background 0.2s ease,border-color 0.2s ease;',
      '}',
      `#${MODAL_ID} .ccin-close:hover{background:rgba(255,122,0,0.24);border-color:#FF7A00;}`,
      `#${MODAL_ID} .ccin-brand{`,
      '  display:inline-flex;align-items:center;gap:8px;margin-bottom:4px;',
      '  font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;',
      '  color:#E2CC9A;',
      '}',
      `#${MODAL_ID} .ccin-title{`,
      '  margin:0 0 6px 0;padding-right:48px;',
      '  font-family:"Playfair Display",Georgia,serif;',
      '  font-size:clamp(24px,3.8vw,30px);font-weight:800;line-height:1.15;color:#FFFFFF;',
      '}',
      `#${MODAL_ID} .ccin-title:focus{outline:none;}`,
      `#${MODAL_ID} .ccin-subtitle-pill{`,
      '  display:inline-block;margin:0 0 8px 0;padding:5px 12px;border-radius:999px;',
      '  background:rgba(196,163,90,0.16);border:1px solid rgba(196,163,90,0.45);',
      '  color:#F6E7C0;font-size:12px;font-weight:700;',
      '}',
      `#${MODAL_ID} .ccin-motto{`,
      '  margin:0 0 10px 0;font-size:13px;font-weight:700;letter-spacing:0.02em;color:#FFD09B;',
      '}',
      `#${MODAL_ID} .ccin-body{`,
      '  display:flex;flex-direction:column;gap:8px;font-size:13.8px;color:#E2E8F0;',
      '}',
      `#${MODAL_ID} .ccin-body p{margin:0;}`,
      `#${MODAL_ID} .ccin-greeting{font-weight:700;color:#FFFFFF;font-size:15px;}`,
      `#${MODAL_ID} .ccin-callout{`,
      '  margin:10px 0;padding:11px 14px;border-radius:14px;',
      '  background:rgba(255,122,0,0.13);border:1px solid rgba(255,122,0,0.45);',
      '  color:#FFFFFF;font-size:14.5px;font-weight:800;line-height:1.38;',
      '}',
      `#${MODAL_ID} .ccin-video-box{`,
      '  margin:0 0 10px 0;padding:8px 10px;border-radius:14px;',
      '  background:rgba(5,9,20,0.72);border:1px solid rgba(196,163,90,0.32);',
      '}',
      `#${MODAL_ID} .ccin-video-row{`,
      '  display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;',
      '}',
      `#${MODAL_ID} .ccin-video-teaser{`,
      '  display:flex;align-items:center;gap:10px;flex:1 1 260px;min-height:48px;',
      '  padding:4px 8px 4px 4px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);',
      '  background:rgba(255,255,255,0.04);color:#FFFFFF;cursor:pointer;text-align:left;',
      '  transition:background 0.2s ease,border-color 0.2s ease;',
      '}',
      `#${MODAL_ID} .ccin-video-teaser:hover{background:rgba(255,122,0,0.14);border-color:#FF7A00;}`,
      `#${MODAL_ID} .ccin-video-thumb-wrap{`,
      '  position:relative;width:88px;height:50px;flex-shrink:0;border-radius:8px;overflow:hidden;background:#000;',
      '}',
      `#${MODAL_ID} .ccin-video-thumb{width:100%;height:100%;object-fit:cover;display:block;}`,
      `#${MODAL_ID} .ccin-video-play-badge{`,
      '  position:absolute;inset:0;margin:auto;width:28px;height:28px;border-radius:999px;',
      '  background:rgba(255,122,0,0.92);color:#FFFFFF;font-size:12px;font-weight:900;',
      '  display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.5);',
      '}',
      `#${MODAL_ID} .ccin-video-meta{display:flex;flex-direction:column;gap:2px;min-width:0;}`,
      `#${MODAL_ID} .ccin-video-title{font-size:13px;font-weight:700;color:#FFFFFF;line-height:1.25;}`,
      `#${MODAL_ID} .ccin-video-sub{font-size:11.5px;color:#E2CC9A;font-weight:600;}`,
      `#${MODAL_ID} .ccin-video-ext{`,
      '  display:inline-flex;align-items:center;min-height:44px;padding:6px 10px;border-radius:10px;',
      '  color:#E2CC9A;font-size:12.5px;font-weight:700;text-decoration:none;white-space:nowrap;',
      '  border:1px solid rgba(196,163,90,0.34);background:rgba(196,163,90,0.08);',
      '}',
      `#${MODAL_ID} .ccin-video-ext:hover{background:rgba(196,163,90,0.2);color:#FFFFFF;}`,
      `#${MODAL_ID} .ccin-video-player-wrap{display:flex;flex-direction:column;gap:8px;width:100%;}`,
      `#${MODAL_ID} .ccin-video-stage{`,
      '  position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;',
      '  border:1px solid rgba(196,163,90,0.36);',
      '}',
      `#${MODAL_ID} .ccin-video-stage iframe{position:absolute;inset:0;width:100%;height:100%;border:0;}`,
      `#${MODAL_ID} .ccin-video-collapse{`,
      '  align-self:flex-end;min-height:44px;padding:6px 12px;border-radius:10px;',
      '  background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);',
      '  color:#FFFFFF;font-size:12.5px;font-weight:700;cursor:pointer;',
      '}',
      `#${MODAL_ID} .ccin-video-collapse:hover{background:rgba(255,255,255,0.16);}`,
      `#${MODAL_ID} .ccin-disclaimer{`,
      '  margin:0 0 10px 0;padding:9px 12px;border-radius:12px;',
      '  background:rgba(255,255,255,0.04);border-left:3px solid rgba(148,163,184,0.65);',
      '  font-size:12px;color:#CBD5E1;line-height:1.42;',
      '}',
      `#${MODAL_ID} .ccin-phone-strip{`,
      '  display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;',
      '  padding:10px 14px;border-radius:14px;margin-bottom:10px;',
      '  background:rgba(5,9,20,0.88);border:1px solid rgba(196,163,90,0.38);',
      '}',
      `#${MODAL_ID} .ccin-phone-meta{display:flex;flex-direction:column;gap:2px;min-width:0;}`,
      `#${MODAL_ID} .ccin-phone-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#CBD5E1;}`,
      `#${MODAL_ID} .ccin-phone-num{font-size:17px;font-weight:900;color:#FFFFFF;letter-spacing:0.03em;}`,
      `#${MODAL_ID} .ccin-copy-btn{`,
      '  min-height:44px;min-width:44px;padding:8px 14px;border-radius:12px;',
      '  background:rgba(196,163,90,0.16);border:1px solid rgba(196,163,90,0.5);',
      '  color:#F6E7C0;font-size:13px;font-weight:700;cursor:pointer;',
      '  transition:background 0.2s ease,border-color 0.2s ease;',
      '}',
      `#${MODAL_ID} .ccin-copy-btn:hover{background:rgba(196,163,90,0.28);border-color:#E2CC9A;}`,
      `#${MODAL_ID} .ccin-ack-label{`,
      '  display:flex;align-items:center;gap:12px;min-height:44px;padding:10px 13px;',
      '  border-radius:14px;border:1px solid rgba(255,255,255,0.18);',
      '  background:rgba(255,255,255,0.04);cursor:pointer;margin-bottom:12px;',
      '  font-size:13.5px;font-weight:600;color:#FFFFFF;line-height:1.38;',
      '}',
      `#${MODAL_ID} .ccin-ack-label input{`,
      '  width:22px;height:22px;min-width:22px;margin:0;',
      '  accent-color:#FF7A00;cursor:pointer;',
      '}',
      `#${MODAL_ID} .ccin-actions{display:flex;flex-direction:column;gap:10px;}`,
      '@media (min-width: 560px){',
      `  #${MODAL_ID} .ccin-actions{flex-direction:row;}`,
      `  #${MODAL_ID} .ccin-btn-proceed{flex:1.45;}`,
      `  #${MODAL_ID} .ccin-btn-back{flex:0.85;}`,
      '}',
      `#${MODAL_ID} .ccin-btn-proceed{`,
      '  width:100%;min-height:48px;padding:13px 18px;border-radius:14px;border:0;',
      '  background:#FF7A00;color:#FFFFFF;font-size:15px;font-weight:800;cursor:pointer;',
      '  box-shadow:0 10px 26px rgba(255,122,0,0.35);',
      '  transition:background 0.2s ease,opacity 0.2s ease,transform 0.15s ease;',
      '}',
      `#${MODAL_ID} .ccin-btn-proceed:hover:not(:disabled){background:#FF8C33;}`,
      `#${MODAL_ID} .ccin-btn-proceed:active:not(:disabled){background:#E66A00;transform:scale(0.99);}`,
      `#${MODAL_ID} .ccin-btn-proceed:disabled{`,
      '  background:#5c3a1e;color:#E2E8F0;opacity:0.72;cursor:not-allowed;box-shadow:none;',
      '}',
      `#${MODAL_ID} .ccin-btn-back{`,
      '  width:100%;min-height:48px;padding:12px 18px;border-radius:14px;',
      '  background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.22);',
      '  color:#FFFFFF;font-size:14.5px;font-weight:700;cursor:pointer;',
      '  transition:background 0.2s ease,border-color 0.2s ease;',
      '}',
      `#${MODAL_ID} .ccin-btn-back:hover{background:rgba(255,255,255,0.16);border-color:rgba(255,255,255,0.4);}`,
      `#${MODAL_ID} button:focus-visible, #${MODAL_ID} input:focus-visible{`,
      '  outline:2px solid #FF7A00;outline-offset:2px;',
      '}',
      `#${MODAL_ID} .ccin-sr-only{`,
      '  position:absolute;width:1px;height:1px;padding:0;margin:-1px;',
      '  overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;',
      '}',
      '@media (prefers-reduced-motion: reduce){',
      `  #${MODAL_ID}, #${MODAL_ID} *{transition-duration:0.01ms !important;animation-duration:0.01ms !important;}`,
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function makeEl(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function announce(msg) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    setTimeout(() => {
      if (liveRegion) liveRegion.textContent = String(msg || '');
    }, 30);
  }

  function ensureModalBuilt() {
    if (overlayEl) return;
    injectStyles();

    overlayEl = document.createElement('div');
    overlayEl.id = MODAL_ID;
    overlayEl.hidden = true;
    overlayEl.setAttribute('aria-hidden', 'true');

    dialogEl = document.createElement('div');
    dialogEl.className = 'ccin-dialog';
    dialogEl.setAttribute('role', 'dialog');
    dialogEl.setAttribute('aria-modal', 'true');
    dialogEl.setAttribute('aria-labelledby', 'ccInfoliniaTitle');
    dialogEl.setAttribute('aria-describedby', 'ccInfoliniaDesc');

    closeBtn = makeEl('button', 'ccin-close', '✕');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Zamknij okno i wróć do strony');
    closeBtn.addEventListener('click', () => closeModal(true));

    const brand = makeEl('div', 'ccin-brand', 'CHRISTIAN CULTURE');

    titleEl = makeEl('h2', 'ccin-title', 'Infolinia NADZIEJA');
    titleEl.id = 'ccInfoliniaTitle';
    titleEl.tabIndex = -1;

    const pill = makeEl('div', 'ccin-subtitle-pill', 'Ponadwyznaniowy wolontariat chrześcijański');
    const motto = makeEl('p', 'ccin-motto', 'Ponad podziałami. Blisko człowieka. W duchu Chrystusa.');

    const desc = makeEl('div', 'ccin-body');
    desc.id = 'ccInfoliniaDesc';
    desc.appendChild(makeEl('p', 'ccin-greeting', 'Drogi Przyjacielu!'));
    desc.appendChild(makeEl(
      'p',
      '',
      'Infolinia NADZIEJA Christian Culture jest inicjatywą społeczną prowadzoną przez chrześcijańskich wolontariuszy, których łączy wiara w Jezusa Chrystusa oraz pragnienie niesienia nadziei, wsparcia i duchowego pocieszenia.'
    ));
    desc.appendChild(makeEl(
      'p',
      '',
      'Nasza posługa ma charakter ponadwyznaniowy i nie reprezentuje żadnego konkretnego Kościoła ani związku wyznaniowego. Osoba, z którą się połączysz, jest chrześcijańskim wolontariuszem i niekoniecznie osobą duchowną.'
    ));
    desc.appendChild(makeEl(
      'p',
      '',
      'Z szacunkiem i życzliwością przyjmujemy każdego człowieka, niezależnie od jego wyznania, przekonań czy sytuacji życiowej.'
    ));

    const callout = makeEl('h3', 'ccin-callout', 'Jesteśmy tutaj, aby Cię wysłuchać, wesprzeć i nieść nadzieję. ❤️');

    const videoBox = makeEl('div', 'ccin-video-box');
    videoBox.id = 'ccInfoliniaVideoBox';

    const videoRow = makeEl('div', 'ccin-video-row');
    videoRow.id = 'ccInfoliniaVideoRow';

    videoTriggerBtn = makeEl('button', 'ccin-video-teaser');
    videoTriggerBtn.type = 'button';
    videoTriggerBtn.id = 'ccInfoliniaVideoTrigger';
    videoTriggerBtn.setAttribute('aria-label', 'Odtwórz wideo YouTube: Infolinia NADZIEJA — Nie jesteś sam');

    const thumbWrap = makeEl('span', 'ccin-video-thumb-wrap');
    const thumbImg = document.createElement('img');
    thumbImg.className = 'ccin-video-thumb';
    thumbImg.src = YT_THUMB_URL;
    thumbImg.alt = 'Miniatura wideo Infolinia NADZIEJA Christian Culture';
    thumbImg.loading = 'lazy';
    thumbImg.decoding = 'async';
    const playBadge = makeEl('span', 'ccin-video-play-badge', '▶');
    playBadge.setAttribute('aria-hidden', 'true');
    thumbWrap.appendChild(thumbImg);
    thumbWrap.appendChild(playBadge);

    const videoMeta = makeEl('span', 'ccin-video-meta');
    videoMeta.appendChild(makeEl('span', 'ccin-video-title', 'Obejrzyj wideo: Infolinia NADZIEJA — Nie jesteś sam!'));
    videoMeta.appendChild(makeEl('span', 'ccin-video-sub', 'Kliknij, aby odtworzyć w oknie'));
    videoTriggerBtn.appendChild(thumbWrap);
    videoTriggerBtn.appendChild(videoMeta);

    const videoExtLink = makeEl('a', 'ccin-video-ext', 'Otwórz na YouTube ↗');
    videoExtLink.href = YT_WATCH_URL;
    videoExtLink.target = '_blank';
    videoExtLink.rel = 'noopener noreferrer';

    videoRow.appendChild(videoTriggerBtn);
    videoRow.appendChild(videoExtLink);

    videoPlayerWrap = makeEl('div', 'ccin-video-player-wrap');
    videoPlayerWrap.id = 'ccInfoliniaVideoPlayerWrap';
    videoPlayerWrap.hidden = true;

    videoStageEl = makeEl('div', 'ccin-video-stage');
    videoStageEl.id = 'ccInfoliniaVideoPlayer';

    const videoCollapseBtn = makeEl('button', 'ccin-video-collapse', 'Ukryj wideo');
    videoCollapseBtn.type = 'button';
    videoCollapseBtn.addEventListener('click', () => {
      resetModalVideo();
      if (videoTriggerBtn) videoTriggerBtn.focus();
      announce('Zatrzymano odtwarzanie wideo.');
    });

    videoPlayerWrap.appendChild(videoStageEl);
    videoPlayerWrap.appendChild(videoCollapseBtn);

    videoTriggerBtn.addEventListener('click', () => {
      if (!videoStageEl || !videoPlayerWrap || !videoRow) return;
      trackInfolinia('infolinia_video_play', { video_id: YT_VIDEO_ID });
      videoStageEl.textContent = '';
      const iframe = document.createElement('iframe');
      iframe.src = YT_EMBED_URL;
      iframe.title = 'Infolinia NADZIEJA CC: Nie jesteś sam! Zadzwoń po wsparcie, modlitwę i pomoc';
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      videoStageEl.appendChild(iframe);
      videoRow.hidden = true;
      videoPlayerWrap.hidden = false;
      announce('Uruchomiono odtwarzanie wideo o Infolinii NADZIEJA.');
    });

    videoBox.appendChild(videoRow);
    videoBox.appendChild(videoPlayerWrap);

    const disclaimer = makeEl(
      'p',
      'ccin-disclaimer',
      'Informacja ważna: Infolinia NADZIEJA nie zastępuje profesjonalnej pomocy medycznej, psychologicznej ani służb ratunkowych. W nagłym zagrożeniu życia lub zdrowia zadzwoń pod numer alarmowy 112.'
    );

    const phoneStrip = makeEl('div', 'ccin-phone-strip');
    const phoneMeta = makeEl('div', 'ccin-phone-meta');
    modeBadgeEl = makeEl('span', 'ccin-phone-label', 'Numer telefonu (Infolinia NADZIEJA)');
    const phoneNum = makeEl('span', 'ccin-phone-num', PHONE_DISPLAY);
    phoneMeta.appendChild(modeBadgeEl);
    phoneMeta.appendChild(phoneNum);

    copyBtn = makeEl('button', 'ccin-copy-btn', 'Kopiuj numer');
    copyBtn.type = 'button';
    copyBtn.setAttribute('aria-label', 'Skopiuj numer telefonu +48 730 958 583');
    copyBtn.addEventListener('click', () => {
      trackInfolinia('infolinia_phone_copy', {});
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(PHONE_DISPLAY).then(() => {
          copyBtn.textContent = 'Skopiowano ✓';
          announce('Skopiowano numer +48 730 958 583 do schowka.');
          setTimeout(() => { if (copyBtn) copyBtn.textContent = 'Kopiuj numer'; }, 2400);
        }).catch(() => {
          announce('Numer telefonu: +48 730 958 583.');
        });
      } else {
        announce('Numer telefonu: +48 730 958 583.');
      }
    });
    phoneStrip.appendChild(phoneMeta);
    phoneStrip.appendChild(copyBtn);

    const ackLabel = makeEl('label', 'ccin-ack-label');
    ackLabel.setAttribute('for', 'ccInfoliniaAck');
    ackCheckbox = document.createElement('input');
    ackCheckbox.type = 'checkbox';
    ackCheckbox.id = 'ccInfoliniaAck';
    ackCheckbox.addEventListener('change', () => {
      const checked = Boolean(ackCheckbox.checked);
      proceedBtn.disabled = !checked;
      proceedBtn.setAttribute('aria-disabled', checked ? 'false' : 'true');
      announce(
        checked
          ? 'Potwierdzono zapoznanie się z komunikatem. Przycisk połączenia jest aktywny.'
          : 'Wymagane potwierdzenie zapoznania się z komunikatem przed połączeniem.'
      );
    });
    const ackText = makeEl('span', '', 'Potwierdzam zapoznanie się z powyższą informacją przed połączeniem.');
    ackLabel.appendChild(ackCheckbox);
    ackLabel.appendChild(ackText);

    const actions = makeEl('div', 'ccin-actions');
    proceedBtn = makeEl('button', 'ccin-btn-proceed', 'Rozumiem – przejdź do połączenia');
    proceedBtn.type = 'button';
    proceedBtn.id = 'ccInfoliniaProceedBtn';
    proceedBtn.disabled = true;
    proceedBtn.setAttribute('aria-disabled', 'true');
    proceedBtn.setAttribute('data-cc-infolinia-confirmed', 'true');
    proceedBtn.addEventListener('click', handleProceed);

    backBtn = makeEl('button', 'ccin-btn-back', 'Wróć do strony');
    backBtn.type = 'button';
    backBtn.id = 'ccInfoliniaBackBtn';
    backBtn.addEventListener('click', () => closeModal(true));

    actions.appendChild(proceedBtn);
    actions.appendChild(backBtn);

    liveRegion = makeEl('div', 'ccin-sr-only');
    liveRegion.id = 'ccInfoliniaLive';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');

    dialogEl.appendChild(closeBtn);
    dialogEl.appendChild(brand);
    dialogEl.appendChild(titleEl);
    dialogEl.appendChild(pill);
    dialogEl.appendChild(motto);
    dialogEl.appendChild(desc);
    dialogEl.appendChild(callout);
    dialogEl.appendChild(videoBox);
    dialogEl.appendChild(disclaimer);
    dialogEl.appendChild(phoneStrip);
    dialogEl.appendChild(ackLabel);
    dialogEl.appendChild(actions);
    dialogEl.appendChild(liveRegion);

    overlayEl.appendChild(dialogEl);

    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) closeModal(true);
    });

    document.body.appendChild(overlayEl);
  }

  function setBackgroundInert(makeInert) {
    if (makeInert) {
      inertSnapshots = [];
      Array.from(document.body.children).forEach((child) => {
        if (child === overlayEl) return;
        inertSnapshots.push({
          el: child,
          hadInert: child.hasAttribute('inert'),
          prevAriaHidden: child.getAttribute('aria-hidden')
        });
        child.setAttribute('inert', '');
        child.setAttribute('aria-hidden', 'true');
      });
    } else {
      inertSnapshots.forEach((snap) => {
        if (!snap.hadInert) snap.el.removeAttribute('inert');
        if (snap.prevAriaHidden === null) snap.el.removeAttribute('aria-hidden');
        else snap.el.setAttribute('aria-hidden', snap.prevAriaHidden);
      });
      inertSnapshots = [];
    }
  }

  function getFocusableElements() {
    if (!dialogEl) return [];
    const candidates = dialogEl.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(candidates).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  function onDialogKeyDown(e) {
    if (!overlayEl || overlayEl.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeModal(true);
      return;
    }
    if (e.key === 'Tab') {
      const focusable = getFocusableElements();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === titleEl || !dialogEl.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last || !dialogEl.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function resetModalVideo() {
    const row = document.getElementById('ccInfoliniaVideoRow');
    if (videoStageEl) videoStageEl.textContent = '';
    if (videoPlayerWrap) videoPlayerWrap.hidden = true;
    if (row) row.hidden = false;
  }

  function openModal(action, triggerEl) {
    ensureModalBuilt();
    resetModalVideo();
    pendingAction = action || { href: `tel:${PHONE_E164}`, isExternal: false, kind: 'tel' };
    lastTriggerEl = triggerEl || document.activeElement || null;

    if (modeBadgeEl) {
      modeBadgeEl.textContent = pendingAction.kind === 'whatsapp'
        ? 'Połączenie WhatsApp (Infolinia NADZIEJA)'
        : 'Połączenie telefoniczne (Infolinia NADZIEJA)';
    }

    ackCheckbox.checked = false;
    proceedBtn.disabled = true;
    proceedBtn.setAttribute('aria-disabled', 'true');

    prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    overlayEl.hidden = false;
    overlayEl.setAttribute('aria-hidden', 'false');
    setBackgroundInert(true);
    trackInfolinia('infolinia_modal_open', { channel: pendingAction.kind || 'tel' });

    document.addEventListener('keydown', onDialogKeyDown, true);

    setTimeout(() => {
      if (titleEl && typeof titleEl.focus === 'function') {
        titleEl.focus();
      }
      announce('Otwarto informację przed połączeniem z Infolinią NADZIEJA Christian Culture. Zaznacz potwierdzenie, aby przejść do połączenia.');
    }, 20);
  }

  function closeModal(restoreFocus) {
    if (!overlayEl || overlayEl.hidden) return;
    if (restoreFocus) {
      trackInfolinia('infolinia_modal_dismiss', { channel: (pendingAction && pendingAction.kind) || 'tel' });
    }
    resetModalVideo();
    overlayEl.hidden = true;
    overlayEl.setAttribute('aria-hidden', 'true');
    setBackgroundInert(false);
    document.body.style.overflow = prevBodyOverflow || '';
    document.removeEventListener('keydown', onDialogKeyDown, true);

    if (restoreFocus && lastTriggerEl && typeof lastTriggerEl.focus === 'function' && document.contains(lastTriggerEl)) {
      lastTriggerEl.focus();
    }
    pendingAction = null;
  }

  function handleProceed() {
    if (!ackCheckbox || !ackCheckbox.checked) {
      announce('Najpierw zaznacz potwierdzenie zapoznania się z informacją.');
      ackCheckbox?.focus();
      return;
    }
    const target = pendingAction || { href: `tel:${PHONE_E164}`, isExternal: false };
    closeModal(false);

    trackInfolinia('infolinia_nadzieja_confirmed', { channel: target.kind || 'tel' });

    if (target.isExternal) {
      window.open(target.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = target.href;
    }
  }

  function handleDocumentClick(e) {
    const match = isNadziejaTrigger(e.target);
    if (!match) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
    openModal(match, match.el);
  }

  document.addEventListener('click', handleDocumentClick, true);

  window.CCInfoliniaNadzieja = {
    __initialized: true,
    PHONE_DISPLAY,
    PHONE_E164,
    open(href) {
      openModal({
        href: href || `tel:${PHONE_E164}`,
        isExternal: /^https?:\/\//i.test(href || ''),
        kind: /wa\.me|whatsapp/i.test(href || '') ? 'whatsapp' : 'tel'
      }, document.activeElement);
    },
    close: () => closeModal(true),
    isOpen: () => Boolean(overlayEl && !overlayEl.hidden)
  };
})();
