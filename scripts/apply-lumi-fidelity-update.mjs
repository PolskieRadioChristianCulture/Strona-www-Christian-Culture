import fs from 'node:fs';

const filePath = 'components/cc-global-chat-button.js';
let raw = fs.readFileSync(filePath, 'utf8');

const isCRLF = raw.includes('\r\n');
const lines = raw.split(/\r?\n/);

let cssStartLine = -1;
let cssEndLine = -1;
let htmlStartLine = -1;
let htmlEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/* ── OKNO GŁÓWNE CZATU LUMI MESSENGER 2.0 ── */')) {
    cssStartLine = i;
  }
  if (lines[i].includes('/* ── RESPONSYWNOŚĆ MOBILE (320-768px) ── */')) {
    cssEndLine = i;
  }
  if (lines[i].includes('<div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">')) {
    htmlStartLine = i;
  }
  if (lines[i].includes('<!-- ════ WIDOK 2: ZESPÓŁ CC (KONTAKT I WSPARCIE) ════ -->')) {
    htmlEndLine = i;
  }
}

const rcmIdx = lines.findIndex(l => l.includes('function renderChatMessages()'));
let rcmPublicStart = -1;
let rcmPublicEnd = -1;
if (rcmIdx !== -1) {
  for (let i = rcmIdx; i < rcmIdx + 30; i++) {
    if (lines[i].trim() === 'if (currentChatPartner.isPublic) {') {
      rcmPublicStart = i;
    }
    if (rcmPublicStart !== -1 && lines[i].trim() === '} else {') {
      rcmPublicEnd = i - 1;
      break;
    }
  }
}

console.log('CSS lines:', cssStartLine, 'to', cssEndLine);
console.log('HTML lines:', htmlStartLine, 'to', htmlEndLine);
console.log('rcmPublic lines:', rcmPublicStart, 'to', rcmPublicEnd);

if (cssStartLine === -1 || cssEndLine === -1 || htmlStartLine === -1 || htmlEndLine === -1 || rcmPublicStart === -1 || rcmPublicEnd === -1) {
  console.error('Line markers could not be determined');
  process.exit(1);
}

const updatedCss = `      /* ── OKNO GŁÓWNE CZATU LUMI MESSENGER 2.0 (PREMIUM 1:1 FIDELITY) ── */
      .cc-chat-drawer-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(4, 6, 14, 0.72) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        z-index: 10001 !important;
        opacity: 0 !important;
        visibility: hidden !important;
        transition: opacity 0.25s ease, visibility 0.25s !important;
        display: flex !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
      }

      .cc-chat-drawer-overlay.is-open {
        opacity: 1 !important;
        visibility: visible !important;
      }

      .cc-chat-drawer {
        position: fixed !important;
        right: max(20px, env(safe-area-inset-right)) !important;
        bottom: max(20px, env(safe-area-inset-bottom)) !important;
        width: 480px !important;
        max-width: calc(100vw - 32px) !important;
        height: 860px !important;
        max-height: calc(100vh - 40px) !important;
        background: #0D1020 !important;
        border: 1px solid #343A50 !important;
        border-radius: 24px !important;
        box-shadow: 0 28px 80px rgba(0, 0, 0, 0.9), 0 0 35px rgba(133, 71, 216, 0.28), inset 0 1px 1px rgba(255, 255, 255, 0.08) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        transform: translateY(20px) scale(0.97) !important;
        opacity: 0 !important;
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        color: #F7F8FC !important;
      }

      .cc-chat-drawer-overlay.is-open .cc-chat-drawer {
        transform: translateY(0) scale(1) !important;
        opacity: 1 !important;
      }

      /* ── 1. NAGŁÓWEK LUMI MESSENGER ── */
      #ccGlobalChatOverlay .cc-chat-radio,
      .cc-chat-drawer .cc-chat-radio,
      .cc-chat-header .cc-chat-radio {
        display: none !important;
      }
      .cc-chat-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 10px 14px 8px 14px !important;
        background: #0D1020 !important;
        border-bottom: none !important;
        min-height: 58px !important;
        box-sizing: border-box !important;
        gap: 10px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-header-brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        text-decoration: none !important;
        min-width: 0 !important;
      }

      .cc-chat-header-logo-wrap {
        position: relative !important;
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        border-radius: 50% !important;
        background: transparent !important;
        padding: 0 !important;
        box-shadow: 0 0 14px rgba(242, 209, 124, 0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-header-icon {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
      }

      .cc-chat-header-titles {
        display: flex !important;
        flex-direction: column !important;
        min-width: 0 !important;
      }

      .cc-chat-header-title {
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        letter-spacing: -0.01em !important;
        color: #F7F8FC !important;
        display: flex !important;
        align-items: center !important;
        gap: 5px !important;
        line-height: 1.2 !important;
      }

      .cc-header-sparkle {
        color: #F2D17C !important;
        font-size: 0.95rem !important;
      }

      .cc-chat-header-sub {
        font-size: 0.74rem !important;
        font-weight: 500 !important;
        color: #A5AEC4 !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        margin-top: 2px !important;
      }

      .cc-chat-live-dot {
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: #20C997 !important;
        box-shadow: 0 0 6px #20C997 !important;
        display: inline-block !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-header-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-chat-icon-btn {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        border-radius: 50% !important;
        border: 1px solid #343A50 !important;
        background: #1D2235 !important;
        color: #A5AEC4 !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 0.95rem !important;
        transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease !important;
        text-decoration: none !important;
      }

      .cc-chat-icon-btn:hover {
        background: rgba(133, 71, 216, 0.25) !important;
        border-color: #8547D8 !important;
        color: #FFFFFF !important;
      }

      .cc-chat-icon-btn.is-close:hover {
        background: rgba(239, 100, 116, 0.25) !important;
        border-color: #EF6474 !important;
        color: #EF6474 !important;
      }

      /* ── 2. KOMPAKTOWY ODTWARZACZ RADIO CC ── */
      .cc-chat-mini-player {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 8px !important;
        padding: 4px 12px !important;
        margin: 2px 14px 6px 14px !important;
        background: #15192B !important;
        border: 1px solid #343A50 !important;
        border-radius: 999px !important;
        min-height: 42px !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-radio-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        min-width: 0 !important;
      }

      .cc-chat-radio-glyph {
        color: #B475F5 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .cc-chat-radio-title {
        font-size: 0.82rem !important;
        font-weight: 650 !important;
        color: #FFFFFF !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-chat-radio-center {
        display: flex !important;
        align-items: center !important;
        gap: 4px !important;
      }

      .cc-chat-radio-eq {
        display: inline-flex !important;
        align-items: flex-end !important;
        gap: 2.5px !important;
        height: 14px !important;
      }

      .cc-chat-radio-eq span {
        width: 3px !important;
        background: #D8AD57 !important;
        border-radius: 1.5px !important;
        transition: height 0.2s ease !important;
      }

      .cc-chat-radio-eq span:nth-child(1) { height: 9px !important; }
      .cc-chat-radio-eq span:nth-child(2) { height: 14px !important; }
      .cc-chat-radio-eq span:nth-child(3) { height: 6px !important; }
      .cc-chat-radio-eq span:nth-child(4) { height: 11px !important; }

      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span {
        animation: ccEqBounce 1s infinite alternate ease-in-out !important;
      }

      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(1) { animation-delay: 0s; height: 12px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(2) { animation-delay: 0.2s; height: 14px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(3) { animation-delay: 0.4s; height: 8px !important; }
      .cc-chat-mini-player.is-playing .cc-chat-radio-eq span:nth-child(4) { animation-delay: 0.6s; height: 13px !important; }

      @keyframes ccEqBounce {
        0% { height: 4px; }
        100% { height: 14px; }
      }

      .cc-chat-radio-play-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 6px !important;
        min-height: 32px !important;
        padding: 0 14px !important;
        background: linear-gradient(135deg, #F2D17C 0%, #D8AD57 100%) !important;
        color: #0D1020 !important;
        font-family: inherit !important;
        font-size: 0.78rem !important;
        font-weight: 750 !important;
        border: none !important;
        border-radius: 999px !important;
        cursor: pointer !important;
        box-shadow: 0 2px 10px rgba(216, 173, 87, 0.3) !important;
        transition: transform 0.18s ease, filter 0.18s ease !important;
        white-space: nowrap !important;
      }

      .cc-chat-radio-play-btn:hover {
        transform: scale(1.03) !important;
        filter: brightness(1.08) !important;
      }

      /* ── 3. NAWIGACJA (5 ZAKŁADEK 1:1) ── */
      .cc-chat-nav-tabs {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 4px 14px 6px 14px !important;
        background: #0D1020 !important;
        border-bottom: none !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-nav-tab {
        flex: 1 1 0 !important;
        min-width: 0 !important;
        min-height: 46px !important;
        padding: 4px 2px !important;
        border-radius: 14px !important;
        border: 1px solid transparent !important;
        background: transparent !important;
        color: #A5AEC4 !important;
        font-family: inherit !important;
        font-size: 0.72rem !important;
        font-weight: 500 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 2px !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
      }

      .cc-chat-nav-tab:hover {
        color: #F7F8FC !important;
      }

      .cc-chat-nav-tab.is-active {
        background: #3F226D !important;
        border: 1px solid rgba(133, 71, 216, 0.6) !important;
        color: #FFFFFF !important;
        font-weight: 700 !important;
        box-shadow: 0 0 12px rgba(133, 71, 216, 0.45) !important;
      }

      .cc-nav-icon {
        font-size: 1.05rem !important;
        line-height: 1 !important;
      }

      /* ── 4. OBSZAR GŁÓWNY ZAKŁADEK ── */
      .cc-chat-tab-panel {
        display: none;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        background: #0D1020;
      }

      .cc-chat-tab-panel.is-active {
        display: flex !important;
      }

      /* ── BANER ASYSTENTEK CC (SHOWCASE 1:1 ARTWORK & HOTSPOTS) ── */
      .cc-chat-asst-showcase {
        position: relative !important;
        margin: 0 14px 6px 14px !important;
        padding: 0 !important;
        border-radius: 20px !important;
        overflow: hidden !important;
        border: 1px solid #343A50 !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
        background: #15192B !important;
        line-height: 0 !important;
        transition: all 0.25s ease !important;
        flex-shrink: 0 !important;
      }

      .cc-chat-asst-showcase.is-collapsed {
        display: none !important;
      }

      .cc-hero-art-container {
        position: relative !important;
        width: 100% !important;
        line-height: 0 !important;
      }

      .cc-hero-art-img {
        width: 100% !important;
        height: auto !important;
        display: block !important;
        border-radius: 20px !important;
      }

      .cc-hero-hotspots {
        position: absolute !important;
        inset: 0 !important;
      }

      .cc-hotspot {
        position: absolute !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        outline: none !important;
        transition: background 0.15s ease, box-shadow 0.15s ease !important;
        -webkit-tap-highlight-color: transparent !important;
      }

      .cc-hotspot:hover, .cc-hotspot:focus-visible {
        background: rgba(242, 209, 124, 0.14) !important;
        box-shadow: inset 0 0 0 1.5px rgba(242, 209, 124, 0.5) !important;
      }

      .cc-hotspot-lea {
        top: 15% !important;
        left: 35% !important;
        width: 23% !important;
        height: 62% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-rut {
        top: 13% !important;
        left: 58% !important;
        width: 26% !important;
        height: 65% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-noemi {
        top: 16% !important;
        left: 84% !important;
        width: 16% !important;
        height: 60% !important;
        border-radius: 14px !important;
      }

      .cc-hotspot-pill1 {
        bottom: 3.5% !important;
        left: 2% !important;
        width: 32.5% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      .cc-hotspot-pill2 {
        bottom: 3.5% !important;
        left: 36% !important;
        width: 31% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      .cc-hotspot-pill3 {
        bottom: 3.5% !important;
        left: 68.5% !important;
        width: 29.5% !important;
        height: 16% !important;
        border-radius: 999px !important;
      }

      /* ŚWIETLISTA LINIA ROZDZIELAJĄCA */
      .cc-lumi-divider {
        margin: 0 14px 6px 14px !important;
        height: 1.5px !important;
        background: linear-gradient(90deg, transparent, #8547D8 25%, #B475F5 50%, #8547D8 75%, transparent) !important;
        box-shadow: 0 0 8px rgba(180, 117, 245, 0.45) !important;
        flex-shrink: 0 !important;
      }

      /* ── OBSZAR AKTYWNEJ ASYSTENTKI (MINI-BAR) ── */
      .cc-chat-active-asst-bar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 0 2px 0 !important;
        margin: 0 14px 6px 14px !important;
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        flex-shrink: 0 !important;
      }

      .cc-active-asst-left {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .cc-active-asst-avatar-wrap {
        position: relative !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        flex-shrink: 0 !important;
      }

      .cc-active-asst-avatar {
        width: 100% !important;
        height: 100% !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 1.5px solid #8547D8 !important;
        display: block !important;
      }

      .cc-active-asst-dot {
        position: absolute !important;
        right: -1px !important;
        bottom: -1px !important;
        width: 8px !important;
        height: 8px !important;
        border-radius: 50% !important;
        background: #20C997 !important;
        border: 1.5px solid #0D1020 !important;
      }

      .cc-active-asst-meta {
        display: flex !important;
        align-items: baseline !important;
        gap: 6px !important;
      }

      .cc-active-asst-name {
        font-size: 0.92rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
      }

      .cc-active-asst-role {
        font-size: 0.8rem !important;
        color: #A5AEC4 !important;
      }

      .cc-asst-toggle-showcase-btn {
        display: none !important;
      }

      /* ── 5. FEED WIADOMOŚCI ── */
      .cc-chat-feed {
        flex: 1 1 auto !important;
        min-height: 0 !important;
        overflow-y: auto !important;
        padding: 0 14px 10px 14px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      /* Kontener powitania 1:1 */
      .cc-asst-welcome-container {
        display: flex !important;
        align-items: stretch !important;
        justify-content: space-between !important;
        gap: 10px !important;
        margin: 0 0 4px 0 !important;
        position: relative !important;
      }

      .cc-asst-welcome-bubble {
        flex: 1 1 70% !important;
        background: rgba(29, 34, 53, 0.8) !important;
        backdrop-filter: blur(8px) !important;
        border-radius: 20px !important;
        border: 1px solid rgba(133, 71, 216, 0.45) !important;
        box-shadow: 0 4px 20px rgba(133, 71, 216, 0.12) !important;
        padding: 12px 14px !important;
        font-size: 0.82rem !important;
        line-height: 1.45 !important;
        color: #D8DEE9 !important;
        min-width: 0 !important;
      }

      .cc-welcome-headline {
        font-size: 0.94rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        margin-bottom: 5px !important;
      }

      .cc-welcome-lead {
        margin: 0 0 5px 0 !important;
        color: #D8DEE9 !important;
        font-size: 0.8rem !important;
        line-height: 1.4 !important;
      }

      .cc-welcome-help {
        margin: 0 0 7px 0 !important;
        color: #D8DEE9 !important;
        font-size: 0.8rem !important;
        line-height: 1.4 !important;
      }

      .cc-welcome-ask {
        margin: 0 !important;
        color: #FFFFFF !important;
        font-size: 0.84rem !important;
        font-weight: 600 !important;
      }

      .cc-welcome-art-wrap {
        width: 88px !important;
        flex: 0 0 88px !important;
        border-radius: 16px !important;
        overflow: hidden !important;
        position: relative !important;
      }

      .cc-welcome-art-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
        border-radius: 16px !important;
      }

      /* 3 Karty Szybkich Akcji 1:1 */
      .cc-chat-quick-cards-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        margin: 0 0 4px 0 !important;
      }

      .cc-quick-card {
        display: flex !important;
        align-items: center !important;
        background: #1D2235 !important;
        border-radius: 16px !important;
        padding: 6px 14px 6px 6px !important;
        min-height: 58px !important;
        color: #F7F8FC !important;
        text-decoration: none !important;
        cursor: pointer !important;
        transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        box-sizing: border-box !important;
      }

      .cc-quick-card:hover {
        transform: translateY(-2px) !important;
      }

      .cc-quick-card.cc-qc-gold {
        border: 1px solid rgba(255, 140, 51, 0.4) !important;
        box-shadow: 0 4px 16px rgba(255, 122, 0, 0.08), inset 0 1px 0 rgba(255, 200, 100, 0.25) !important;
      }

      .cc-quick-card.cc-qc-blue {
        border: 1px solid rgba(99, 102, 241, 0.4) !important;
        box-shadow: 0 4px 16px rgba(99, 102, 241, 0.08), inset 0 1px 0 rgba(160, 170, 255, 0.25) !important;
      }

      .cc-quick-card.cc-qc-purple {
        border: 1px solid rgba(168, 85, 247, 0.4) !important;
        box-shadow: 0 4px 16px rgba(168, 85, 247, 0.08), inset 0 1px 0 rgba(220, 150, 255, 0.25) !important;
      }

      .cc-qc-thumb-wrap {
        width: 76px !important;
        height: 48px !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        flex-shrink: 0 !important;
        margin-right: 12px !important;
        background: #0D1020 !important;
      }

      .cc-qc-thumb-img {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        display: block !important;
      }

      .cc-qc-meta {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        min-width: 0 !important;
      }

      .cc-qc-title {
        font-size: 0.9rem !important;
        font-weight: 700 !important;
        color: #FFFFFF !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .cc-qc-desc {
        font-size: 0.72rem !important;
        color: #A5AEC4 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .cc-qc-arrow {
        color: #A5AEC4 !important;
        font-size: 1.15rem !important;
        margin-left: 6px !important;
        font-weight: 600 !important;
        line-height: 1 !important;
      }

      /* ── 6. STAŁE POLE WPISYWANIA WIADOMOŚCI (COMPOSER 1:1) ── */
      .cc-chat-composer-premium {
        position: sticky !important;
        bottom: 0 !important;
        background: #0D1020 !important;
        border-top: 1px solid #1D2235 !important;
        padding: 8px 14px calc(8px + env(safe-area-inset-bottom, 0px)) 14px !important;
        flex-shrink: 0 !important;
        z-index: 10 !important;
      }

      .cc-chat-composer-form {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .cc-composer-plus-btn {
        width: 38px !important;
        height: 38px !important;
        min-width: 38px !important;
        min-height: 38px !important;
        border-radius: 50% !important;
        background: #1D2235 !important;
        border: 1.5px solid #343A50 !important;
        color: #FFFFFF !important;
        font-size: 1.3rem !important;
        font-weight: 400 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        transition: background 0.18s ease, transform 0.18s ease !important;
        line-height: 1 !important;
      }

      .cc-composer-plus-btn:hover {
        background: #252C44 !important;
        transform: scale(1.05) !important;
      }

      .cc-composer-input-wrap {
        flex: 1 !important;
        background: #0D1020 !important;
        border: 1px solid rgba(216, 173, 87, 0.45) !important;
        border-radius: 999px !important;
        display: flex !important;
        align-items: center !important;
        padding: 0 8px 0 14px !important;
        min-height: 40px !important;
        box-sizing: border-box !important;
        transition: border-color 0.18s ease !important;
      }

      .cc-composer-input-wrap:focus-within {
        border-color: #F2D17C !important;
        box-shadow: 0 0 10px rgba(242, 209, 124, 0.25) !important;
      }

      .cc-composer-textarea {
        background: transparent !important;
        border: none !important;
        outline: none !important;
        color: #FFFFFF !important;
        font-family: inherit !important;
        font-size: 0.78rem !important;
        flex: 1 !important;
        resize: none !important;
        line-height: 1.35 !important;
        padding: 6px 0 !important;
      }

      .cc-composer-textarea::placeholder {
        color: #7E88A2 !important;
      }

      .cc-composer-mic-btn {
        background: transparent !important;
        border: none !important;
        color: #A5AEC4 !important;
        cursor: pointer !important;
        padding: 4px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 1.1rem !important;
        flex-shrink: 0 !important;
        transition: color 0.18s ease !important;
      }

      .cc-composer-mic-btn:hover {
        color: #FFFFFF !important;
      }

      .cc-composer-send-btn {
        background: #FFC436 !important;
        color: #0D1020 !important;
        font-weight: 800 !important;
        font-size: 0.82rem !important;
        border: none !important;
        border-radius: 999px !important;
        padding: 0 16px !important;
        min-height: 40px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
        box-shadow: 0 2px 10px rgba(255, 196, 54, 0.35) !important;
        transition: transform 0.18s ease, filter 0.18s ease !important;
      }

      .cc-composer-send-btn:hover {
        transform: scale(1.02) !important;
        filter: brightness(1.06) !important;
      }`;

const updatedHtml = `      <div class="cc-chat-drawer" role="dialog" aria-modal="true" aria-labelledby="ccChatHeaderTitle">
        
        <!-- 1. NAGŁÓWEK LUMI MESSENGER -->
        <header class="cc-chat-header">
          <a href="/mess" class="cc-chat-header-brand" id="ccChatHeaderBrand" title="LUMI Messenger">
            <div class="cc-chat-header-logo-wrap" aria-hidden="true">
              <img src="/images/chat/lumi_header_logo.webp" id="ccChatHeaderPartnerAvatar" alt="LUMI Messenger" class="cc-chat-header-icon" width="38" height="38" onerror="this.src='/images/chat/cc-chat-button-120.webp'">
            </div>
            <div class="cc-chat-header-titles">
              <div class="cc-chat-header-title" id="ccChatHeaderTitle">
                <span>LUMI Messenger</span>
                <span class="cc-header-sparkle">✨</span>
              </div>
              <div class="cc-chat-header-sub">
                <span class="cc-chat-live-dot" aria-hidden="true"></span>
                <span id="ccChatHeaderSubText">Na żywo w Chrystusie</span>
              </div>
            </div>
          </a>
          <div class="cc-chat-header-actions">
            <button type="button" class="cc-chat-icon-btn" id="ccChatNotifBtn" title="Powiadomienia" aria-label="Powiadomienia">
              🔔
            </button>
            <button type="button" class="cc-chat-icon-btn" id="ccChatSettingsBtn" title="Ustawienia czatu" aria-label="Ustawienia czatu">
              ⚙️
            </button>
            <button type="button" class="cc-chat-icon-btn is-close cc-chat-close-btn" id="ccChatCloseBtn" aria-label="Zamknij czat" title="Zamknij">
              ✕
            </button>
          </div>
        </header>

        <!-- 2. KOMPAKTOWY ODTWARZACZ RADIO CHRISTIAN CULTURE -->
        <section class="cc-chat-mini-player" id="ccChatMiniPlayer" aria-label="Odtwarzacz Radio Christian Culture">
          <div class="cc-chat-radio-left">
            <span class="cc-chat-radio-glyph" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4.93 4.93a10 10 0 0 0 0 14.14M2 2a14.14 14.14 0 0 0 0 20M19.07 4.93a10 10 0 0 1 0 14.14M22 2a14.14 14.14 0 0 1 0 20M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>
              </svg>
            </span>
            <span class="cc-chat-radio-title" id="ccChatRadioTitle">Radio Christian Culture PL</span>
          </div>
          <div class="cc-chat-radio-center">
            <div class="cc-chat-radio-eq" id="ccChatRadioEq" aria-hidden="true">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <button type="button" class="cc-chat-radio-play-btn" id="ccChatRadioPlayBtn" aria-label="Włącz lub zatrzymaj radio">
            <span id="ccChatRadioPlayIcon">▶</span>
            <span id="ccChatRadioPlayText">Słuchaj</span>
          </button>
        </section>

        <!-- 3. NAWIGACJA: 5 ZAKŁADEK 1:1 -->
        <nav class="cc-chat-nav-tabs" role="tablist" aria-label="Nawigacja czatu">
          <button type="button" class="cc-chat-nav-tab is-active" id="ccChatTabLiveBtn" role="tab" aria-selected="true" aria-controls="ccChatViewLive">
            <span class="cc-nav-icon">💬</span>
            <span>Czat</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabTeamBtn" role="tab" aria-selected="false" aria-controls="ccChatViewTeam">
            <span class="cc-nav-icon">👥</span>
            <span>Zespół CC</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMembersBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMembers">
            <span class="cc-nav-icon">👥</span>
            <span>Społeczność</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabChannelsBtn" role="tab" aria-selected="false" aria-controls="ccChatViewChannels">
            <span class="cc-nav-icon">🌐</span>
            <span>Zasoby</span>
          </button>
          <button type="button" class="cc-chat-nav-tab" id="ccChatTabMoreBtn" role="tab" aria-selected="false" aria-controls="ccChatViewMore">
            <span class="cc-nav-icon">•••</span>
            <span>Więcej</span>
          </button>
        </nav>

        <!-- ════ WIDOK 1: CZAT & ASYSTENTKI CC ════ -->
        <div class="cc-chat-tab-panel is-active" id="ccChatViewLive" role="tabpanel" aria-labelledby="ccChatTabLiveBtn">
          
          <!-- BANER ASYSTENTEK CC (SHOWCASE 1:1 ARTWORK & HOTSPOTS) -->
          <section class="cc-chat-asst-showcase" id="ccChatAsstShowcase" aria-label="Asystentki Christian Culture">
            <div class="cc-hero-art-container">
              <img src="/images/chat/lumi_hero_banner.webp" alt="Asystentki Christian Culture - Lea, Rut, Noemi" class="cc-hero-art-img" width="474" height="288" loading="eager">
              <div class="cc-hero-hotspots">
                <!-- Lea -->
                <button type="button" class="cc-hotspot cc-hotspot-lea cc-trio-card" data-asst-id="asystentka-2" role="radio" aria-checked="false" aria-label="Wybierz Lea - Organizer i planista" title="Lea - Organizer i planista"></button>
                <!-- Rut (Center) -->
                <button type="button" class="cc-hotspot cc-hotspot-rut cc-trio-card is-active" data-asst-id="asystentka-1" role="radio" aria-checked="true" aria-label="Wybierz Rut - Wspieram Cię i pomagam" title="Rut - Wspieram Cię i pomagam"></button>
                <!-- Noemi -->
                <button type="button" class="cc-hotspot cc-hotspot-noemi cc-trio-card" data-asst-id="asystentka-3" role="radio" aria-checked="false" aria-label="Wybierz Noemi - Twoje zasoby i rozwiązania" title="Noemi - Twoje zasoby i rozwiązania"></button>
                <!-- Pigułki pod banerem -->
                <button type="button" class="cc-hotspot cc-hotspot-pill1 cc-showcase-pill" id="ccPillRadio" aria-label="Posłuchaj radia" title="Posłuchaj radia"></button>
                <button type="button" class="cc-hotspot cc-hotspot-pill2 cc-showcase-pill" id="ccPillBible" aria-label="Poznaj Biblię" title="Poznaj Biblię"></button>
                <button type="button" class="cc-hotspot cc-hotspot-pill3 cc-showcase-pill" id="ccPillDiscover" aria-label="Odkryj CC" title="Odkryj CC"></button>
              </div>
            </div>
          </section>

          <!-- ŚWIETLISTA LINIA ROZDZIELAJĄCA -->
          <div class="cc-lumi-divider" aria-hidden="true"></div>

          <!-- MINI-BAR AKTYWNEJ ASYSTENTKI -->
          <div class="cc-chat-active-asst-bar" id="ccChatActiveAsstBar">
            <div class="cc-active-asst-left">
              <div class="cc-active-asst-avatar-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_avatar_rut_circle.webp" alt="Rut" id="ccChatActiveAsstAvatar" class="cc-active-asst-avatar" onerror="this.src='/images/chat/assistants/asystentka-1.webp'">
                <span class="cc-active-asst-dot"></span>
              </div>
              <div class="cc-active-asst-meta">
                <span class="cc-active-asst-name" id="ccChatActiveAsstName">Rut</span>
                <span class="cc-active-asst-role" id="ccChatActiveAsstRole">· Asystentka CC</span>
              </div>
            </div>
            <button type="button" class="cc-asst-toggle-showcase-btn" id="ccAsstToggleShowcaseBtn" style="display:none;" aria-label="Zwiń / rozwiń prezentację asystentek" title="Zwiń / rozwiń asystentki">
              <span id="ccAsstToggleIcon">▾</span>
            </button>
          </div>

          <!-- FEED WIADOMOŚCI I REKOMENDACJI -->
          <div class="cc-chat-partners-bar" id="ccChatPartnersBar" style="display:none !important;"></div>
          <div class="cc-chat-feed" id="ccChatFeed">
            
            <!-- Powitanie 1:1 -->
            <div class="cc-asst-welcome-container">
              <div class="cc-asst-welcome-bubble" id="ccChatWelcomeBubble">
                <div class="cc-welcome-headline">Cześć! ❤️ Dobrze, że jesteś.</div>
                <div class="cc-welcome-lead" id="ccChatWelcomeBody">Nazywam się Rut – jestem Asystentką Christian Culture i gospodynią LUMI MESS.</div>
                <div class="cc-welcome-help">Przez całą dobę pomogę Ci znaleźć radio 24/7, Biblię, kursy, filmy VOD, społeczność LUMINA lub kontakt z zespołem.</div>
                <div class="cc-welcome-ask">W czym mogę Ci dziś pomóc?</div>
              </div>
              <div class="cc-welcome-art-wrap" aria-hidden="true">
                <img src="/images/chat/lumi_welcome_cross_bible.webp" alt="Krzyż i Biblia" class="cc-welcome-art-img" width="88" height="168">
              </div>
            </div>

            <!-- 3 Karty Szybkich Akcji 1:1 -->
            <div class="cc-chat-quick-cards-grid" id="ccChatQuickCardsGrid">
              <a href="/player" class="cc-quick-card cc-qc-gold" id="ccQcRadio" aria-label="Posłuchaj radia">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_mic.webp" alt="Radio 24/7" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">🎧 Posłuchaj radia</span>
                  <span class="cc-qc-desc">Radio 24/7 · Audycje · Muzyka · Na żywo</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>

              <a href="/Ewangelia" class="cc-quick-card cc-qc-blue" id="ccQcBible" aria-label="Poznaj Dobrą Nowinę">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_bible.webp" alt="Biblia" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">📖 Poznaj Dobrą Nowinę</span>
                  <span class="cc-qc-desc">Biblia · Wersety · Kontemplacja · Kursy</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>

              <a href="/akademia" class="cc-quick-card cc-qc-purple" id="ccQcAcademy" aria-label="Akademia Biblijna">
                <div class="cc-qc-thumb-wrap" aria-hidden="true">
                  <img src="/images/chat/lumi_thumb_cap.webp" alt="Akademia Biblijna" class="cc-qc-thumb-img" width="76" height="48">
                </div>
                <div class="cc-qc-meta">
                  <span class="cc-qc-title">🎓 Akademia Biblijna</span>
                  <span class="cc-qc-desc">Kursy · Wykłady · Rozwój duchowy</span>
                </div>
                <span class="cc-qc-arrow" aria-hidden="true">›</span>
              </a>
            </div>

            <!-- Strumień wiadomości -->
            <div id="ccChatMessagesList" style="display: flex; flex-direction: column; gap: 10px;"></div>

            <!-- Przycisk powrotu do najnowszych wiadomości -->
            <button type="button" class="cc-chat-scroll-bottom-btn" id="ccChatScrollBottomBtn" aria-label="Przejdź do najnowszych wiadomości">
              Przejdź do najnowszych ↓
            </button>
          </div>

          <!-- 6. STAŁE POLE WPISYWANIA WIADOMOŚCI -->
          <div class="cc-chat-composer-premium" id="ccChatComposer">
            <div class="cc-composer-popover" id="ccComposerPopover" hidden>
              <button type="button" class="cc-popover-item" data-query="Jak posłuchać radia?">🎧 Radio 24/7</button>
              <button type="button" class="cc-popover-item" data-query="Gdzie znajdę Biblię i rozważania?">📖 Biblia i rozważania</button>
              <button type="button" class="cc-popover-item" data-query="Jakie kursy oferuje Akademia Biblijna?">🎓 Akademia Biblijna</button>
              <button type="button" class="cc-popover-item" data-query="Jak mogę skontaktować się ze Sztabem CC?">📞 Kontakt i pomoc</button>
              <button type="button" class="cc-popover-item" data-query="Czym jest misja Christian Culture?">🕊️ O misji CC</button>
            </div>

            <form class="cc-chat-composer-form" id="ccChatForm">
              <button type="button" class="cc-composer-plus-btn" id="ccChatPlusBtn" aria-label="Więcej opcji i szybkie pytania" title="Szybkie pytania">+</button>
              <div class="cc-composer-input-wrap">
                <textarea
                  id="ccChatInput"
                  class="cc-composer-textarea"
                  rows="1"
                  placeholder="Zadaj pytanie (np. radio, Biblia, kursy, pomoc)"
                  maxlength="500"
                  autocomplete="off"
                  aria-label="Zadaj pytanie asystentce"
                ></textarea>
              </div>
              <button type="button" class="cc-composer-mic-btn" id="ccChatMicBtn" aria-label="Mów do mikrofonu (rozpoznawanie mowy)" title="Naciśnij, aby mówić">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <button type="submit" class="cc-composer-send-btn" id="ccChatSendBtn" aria-label="Wyślij wiadomość" title="Wyślij wiadomość">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <span>Wyślij</span>
              </button>
            </form>
          </div>
        </div>`;

const renderReplacement = `      if (currentChatPartner.isPublic) {
        list.innerHTML = '';
        return;`;

const finalLines = [
  ...lines.slice(0, cssStartLine),
  updatedCss,
  ...lines.slice(cssEndLine, htmlStartLine),
  updatedHtml,
  ...lines.slice(htmlEndLine, rcmPublicStart),
  renderReplacement,
  ...lines.slice(rcmPublicEnd + 1)
];

let fullText = finalLines.join(isCRLF ? '\r\n' : '\n');

// In refreshAssistantUI:
fullText = fullText.replace("if (activeRole) activeRole.textContent = `· ${asst.role}`;", "if (activeRole) activeRole.textContent = '· Asystentka CC';");

fs.writeFileSync(filePath, fullText, 'utf8');
console.log('Successfully applied all changes without any syntax disruption!');
