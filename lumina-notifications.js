/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA NOTIFICATION ENGINE (lumina-notifications.js)
 * Zaawansowany, Dwupoziomowy System Powiadomień (In-App Dzwonek 🔔 + Web Push)
 * Standard: Facebook-Style Notification Center | Ekosystem: Christian Culture
 * ══════════════════════════════════════════════════════════════════════════
 */
(function initLuminaNotificationSystem() {
    if (window.LuminaNotifications) return;

    class LuminaNotificationEngine {
        constructor() {
            this.unreadCount = 0;
            this.notifications = [];
            this.audioCtx = null;
            this.initAudio();
            this.initUI();
            this.loadStoredNotifications();
            this.listenToEvents();
            this.initFirestoreRealtimeListener();
            this.initSoftPrompt();
        }

        // 0. Dźwięk powiadomienia (Harmoniczne Chime CC z Debounce & Quiet Hours)
        initAudio() {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.audioCtx = new AudioContextClass();
                }
            } catch(e) {}
        }

        isQuietHours() {
            try {
                const prefs = JSON.parse(localStorage.getItem('lumina_notif_prefs') || '{}');
                if (prefs.quietHoursEnabled === false) return false;
                const h = new Date().getHours();
                const start = prefs.quietHoursStart ? parseInt(prefs.quietHoursStart.split(':')[0], 10) : 22;
                const end = prefs.quietHoursEnd ? parseInt(prefs.quietHoursEnd.split(':')[0], 10) : 8;
                return (start > end) ? (h >= start || h < end) : (h >= start && h < end);
            } catch(e) {
                return false;
            }
        }

        playChime() {
            try {
                if (this.isQuietHours()) return; // Tryb nocny / Quiet Hours

                const now = Date.now();
                if (window._lastLuminaChimeTime && (now - window._lastLuminaChimeTime < 1800)) {
                    return; // Zabezpieczenie przed nałożeniem dźwięków (Debounce)
                }
                window._lastLuminaChimeTime = now;

                if (!this.audioCtx) this.initAudio();
                if (!this.audioCtx) return;
                const ctx = this.audioCtx;
                if (ctx.state === 'suspended') {
                    ctx.resume().catch(() => {});
                }

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
                osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

                gain.gain.setValueAtTime(0.14, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start();
                osc.stop(ctx.currentTime + 0.38);
            } catch(e) {}
        }

        // 1. Inicjalizacja Dzwonka i Dropdownu
        initUI() {
            const existing = document.getElementById('lumina-notification-center');
            if (existing) existing.remove();

            const html = `
            <div id="lumina-notification-center" class="notif-wrapper">
                <button type="button" id="lumina-notif-btn" class="notif-bell-btn" title="Centrum powiadomień LUMINA" onclick="window.LuminaNotifications.toggleDropdown(event)">
                    <i class="fa-solid fa-bell"></i>
                    <span id="notif-badge" class="notif-badge" style="display:none;"></span>
                </button>
                
                <div id="notif-dropdown" class="notif-dropdown" onclick="event.stopPropagation()">
                    <div class="notif-header">
                        <div class="notif-header-title-wrap">
                            <i class="fa-solid fa-bell notif-header-icon"></i>
                            <h4 class="notif-header-title">Powiadomienia</h4>
                        </div>
                        <div class="notif-header-right">
                            <div id="notif-header-actions" class="notif-header-actions" style="display:none;">
                                <button type="button" onclick="window.LuminaNotifications.markAllAsRead()" class="notif-action-btn notif-read-btn" title="Oznacz wszystko jako przeczytane">Odczytaj</button>
                                <button type="button" onclick="window.LuminaNotifications.clearAll()" class="notif-action-btn notif-clear-btn" title="Wyczyść listę powiadomień">Wyczyść</button>
                            </div>
                            <button type="button" class="notif-close-btn" onclick="window.LuminaNotifications.closeDropdown()" title="Zamknij powiadomienia" aria-label="Zamknij">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div id="notif-push-bar" class="notif-push-bar"></div>
                    <div id="notif-list" class="notif-list"></div>
                </div>
            </div>

            <style>
                .notif-wrapper {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    z-index: 10001;
                    margin: 0 4px;
                }
                .notif-bell-btn {
                    background: rgba(15, 23, 42, 0.85) !important;
                    border: 1.5px solid rgba(168, 85, 247, 0.45) !important;
                    color: #c084fc !important;
                    width: 38px !important;
                    height: 38px !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    position: relative !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 0 10px rgba(168, 85, 247, 0.25) !important;
                    -webkit-tap-highlight-color: transparent !important;
                    outline: none !important;
                }
                .notif-bell-btn i {
                    font-size: 1.05rem !important;
                    color: #c084fc !important;
                    filter: drop-shadow(0 0 4px rgba(168, 85, 247, 0.4)) !important;
                    transition: color 0.2s, transform 0.2s !important;
                }
                .notif-bell-btn:hover {
                    background: rgba(168, 85, 247, 0.25) !important;
                    border-color: rgba(192, 132, 252, 0.8) !important;
                    color: #ffffff !important;
                    transform: scale(1.08) !important;
                    box-shadow: 0 0 16px rgba(168, 85, 247, 0.5) !important;
                }
                .notif-bell-btn:hover i {
                    color: #ffffff !important;
                    filter: drop-shadow(0 0 6px rgba(168, 85, 247, 0.6)) !important;
                }
                .notif-badge {
                    position: absolute !important;
                    top: -4px !important;
                    right: -4px !important;
                    background: #ef4444 !important;
                    color: #fff !important;
                    font-size: 10px !important;
                    font-weight: 800 !important;
                    min-width: 18px !important;
                    height: 18px !important;
                    border-radius: 9px !important;
                    padding: 0 4px !important;
                    display: none;
                    align-items: center !important;
                    justify-content: center !important;
                    border: 2px solid #0b1838 !important;
                    animation: notifPulseBadge 2s infinite !important;
                    box-shadow: 0 0 10px rgba(239,68,68,0.8) !important;
                }
                .notif-badge:empty,
                .notif-badge[data-count="0"] {
                    display: none !important;
                }
                .notif-dropdown {
                    position: absolute !important;
                    top: calc(100% + 10px) !important;
                    right: 0 !important;
                    width: 350px !important;
                    max-width: calc(100vw - 24px) !important;
                    background: rgba(11, 24, 56, 0.98) !important;
                    border: 1.5px solid rgba(168, 85, 247, 0.45) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.85), 0 0 20px rgba(168, 85, 247, 0.15) !important;
                    display: none;
                    flex-direction: column !important;
                    z-index: 100000 !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    overflow: hidden !important;
                }
                
                @media (max-width: 500px) {
                    .notif-dropdown {
                        position: fixed !important;
                        top: 70px !important;
                        left: 10px !important;
                        right: 10px !important;
                        width: auto !important;
                        transform: none !important;
                    }
                }

                .notif-dropdown.active { 
                    display: flex !important; 
                    animation: notifSlideDown 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important; 
                }
                .notif-header {
                    padding: 12px 16px !important;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
                    background: rgba(255,255,255,0.03) !important;
                }
                .notif-header-title-wrap {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                }
                .notif-header-icon {
                    color: #c084fc !important;
                    font-size: 0.95rem !important;
                }
                .notif-header-title {
                    margin: 0 !important;
                    font-size: 14px !important;
                    font-weight: 800 !important;
                    color: #fff !important;
                    font-family: 'Outfit', sans-serif !important;
                }
                .notif-header-right {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                    margin-left: auto !important;
                }
                .notif-header-actions {
                    display: flex !important;
                    align-items: center !important;
                    gap: 10px !important;
                }
                .notif-action-btn { 
                    background: none !important; 
                    border: none !important; 
                    color: #c084fc !important; 
                    font-size: 11.5px !important; 
                    font-weight: 700 !important; 
                    cursor: pointer !important; 
                    transition: opacity 0.2s !important; 
                    padding: 2px 4px !important;
                }
                .notif-action-btn:hover { 
                    opacity: 0.8 !important; 
                    text-decoration: underline !important; 
                }
                .notif-clear-btn {
                    color: #94a3b8 !important;
                }
                .notif-clear-btn:hover {
                    color: #f87171 !important;
                }
                .notif-close-btn {
                    background: rgba(255, 255, 255, 0.06) !important;
                    border: 1px solid rgba(255, 255, 255, 0.12) !important;
                    color: #94a3b8 !important;
                    width: 24px !important;
                    height: 24px !important;
                    border-radius: 50% !important;
                    cursor: pointer !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 11px !important;
                    padding: 0 !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    line-height: 1 !important;
                }
                .notif-close-btn:hover {
                    color: #fff !important;
                    background: rgba(239, 68, 68, 0.25) !important;
                    border-color: rgba(239, 68, 68, 0.5) !important;
                    transform: scale(1.08) !important;
                }
                .notif-push-bar {
                    display: none;
                    padding: 9px 14px;
                    background: rgba(245, 158, 11, 0.12);
                    border-bottom: 1px solid rgba(245, 158, 11, 0.25);
                    font-size: 11.5px;
                    color: #fef08a;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                }
                .notif-push-bar.show {
                    display: flex !important;
                }
                .notif-push-enable-btn {
                    background: #f59e0b;
                    color: #0b1838;
                    border: none;
                    border-radius: 12px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 800;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }
                .notif-push-enable-btn:hover {
                    background: #fde047;
                    transform: scale(1.04);
                }
                .notif-list { 
                    max-height: 380px !important; 
                    overflow-y: auto !important; 
                }
                .notif-item {
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                    padding: 12px 16px !important;
                    border-bottom: 1px solid rgba(255,255,255,0.05) !important;
                    cursor: pointer !important;
                    transition: background 0.2s !important;
                    text-decoration: none !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                }
                .notif-item:hover { 
                    background: rgba(255,255,255,0.06) !important; 
                }
                .notif-item.unread { 
                    background: rgba(245,158,11,0.10) !important; 
                    border-left: 3px solid #f59e0b !important; 
                }
                .notif-item img,
                .notif-avatar,
                .notif-item-icon { 
                    width: 40px !important; 
                    height: 40px !important; 
                    min-width: 40px !important;
                    min-height: 40px !important;
                    max-width: 40px !important;
                    max-height: 40px !important;
                    border-radius: 50% !important; 
                    object-fit: cover !important; 
                    border: 1.5px solid rgba(250,204,21,0.4) !important; 
                    flex-shrink: 0 !important; 
                    display: block !important;
                }
                .notif-content,
                .notif-item-content { 
                    flex: 1 !important; 
                    font-size: 12.5px !important; 
                    color: #cbd5e1 !important; 
                    line-height: 1.4 !important; 
                    min-width: 0 !important;
                    overflow: hidden !important;
                    word-break: break-word !important;
                }
                .notif-content strong,
                .notif-item-title { 
                    color: #fff !important; 
                    font-size: 13px !important; 
                    font-weight: 700 !important;
                    line-height: 1.35 !important;
                }
                .notif-item-body {
                    margin-top: 2px !important;
                    font-size: 12px !important;
                    color: #cbd5e1 !important;
                    line-height: 1.35 !important;
                    word-break: break-word !important;
                }
                .notif-time { 
                    font-size: 10.5px !important; 
                    color: #94a3b8 !important; 
                    margin-top: 4px !important; 
                }
                .notif-empty { 
                    padding: 30px 20px !important;
                    text-align: center !important;
                    color: #94a3b8 !important;
                    font-size: 13px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    gap: 8px !important;
                }
                .notif-empty i {
                    font-size: 24px !important;
                    color: #64748b !important;
                }
                @keyframes notifSlideDown { 
                    from { opacity:0; transform: translateY(-8px) scale(0.96); } 
                    to { opacity:1; transform: translateY(0) scale(1); } 
                }
                @keyframes notifPulseBadge { 
                    0%, 100% { opacity: 1; transform: scale(1); } 
                    50% { opacity: 0.7; transform: scale(1.1); } 
                }
            
                /* ═════════ MOBILE NOTIFICATION CENTER ═════════ */
                @media (max-width: 640px) {
                    #lumina-notification-center {
                        display: inline-flex !important;
                    }
                }

                #luminaPushSoftPrompt {
                    position: fixed;
                    bottom: calc(88px + env(safe-area-inset-bottom, 16px));
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000000000 !important;
                    width: calc(100% - 28px);
                    max-width: 440px;
                    animation: slideUpPrompt 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    pointer-events: auto !important;
                }
                #luminaPushSoftPrompt.fade-out {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                    pointer-events: none !important;
                }
                .lumina-push-soft-card {
                    background: #0f172a;
                    background: linear-gradient(135deg, #0f172a, #0b1226);
                    border: 1.5px solid rgba(250, 204, 21, 0.85);
                    border-radius: 20px;
                    padding: 14px 16px;
                    box-shadow: 0 16px 50px rgba(0,0,0,0.95), 0 0 30px rgba(250, 204, 21, 0.25);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #fff;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }
                .push-soft-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, rgba(236,72,153,0.35), rgba(139,92,246,0.35));
                    border: 1px solid rgba(250, 204, 21, 0.85);
                    color: #facc15;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.15rem;
                    flex-shrink: 0;
                    animation: pulseBell 2s infinite;
                }
                @keyframes pulseBell {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 8px #facc15); }
                }
                .push-soft-content {
                    flex: 1;
                    min-width: 0;
                }
                .push-soft-title {
                    font-size: 0.88rem;
                    font-weight: 800;
                    color: #facc15;
                    font-family: 'Outfit', sans-serif;
                    margin-bottom: 2px;
                }
                .push-soft-desc {
                    font-size: 0.76rem;
                    color: #cbd5e1;
                    line-height: 1.35;
                }
                .push-soft-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                }
                .push-soft-btn-enable {
                    background: linear-gradient(135deg, #ec4899, #8b5cf6);
                    border: 1px solid rgba(250, 204, 21, 0.8);
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.82rem;
                    min-height: 44px;
                    padding: 8px 16px;
                    border-radius: 22px;
                    cursor: pointer;
                    white-space: nowrap;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(236,72,153,0.45);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .push-soft-btn-enable:hover {
                    box-shadow: 0 6px 20px rgba(236,72,153,0.65);
                    transform: scale(1.03);
                }
                .push-soft-btn-enable:active {
                    transform: scale(0.95);
                }
                .push-soft-btn-close {
                    background: rgba(255,255,255,0.12);
                    border: 1px solid rgba(255,255,255,0.18);
                    color: #cbd5e1;
                    min-width: 44px;
                    min-height: 44px;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .push-soft-btn-close:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.22);
                    transform: scale(1.05);
                }
                @keyframes slideUpPrompt {
                    from { opacity: 0; transform: translateX(-50%) translateY(30px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

            </style>`;

            // Wstrzyknięcie dzwonka w navbarze (obok Menu w .lumina-nav-actions lub w akcjach nagłówka)
            const topMenuBtn = document.getElementById('topNavMenuBtn') || 
                               document.querySelector('.nav-menu-wrapper');
            const navActions = document.querySelector('.lumina-nav-actions') ||
                               document.querySelector('.header-right') || 
                               document.querySelector('.nav-actions') ||
                               document.querySelector('.header-actions');
            
            if (topMenuBtn && topMenuBtn.parentElement) {
                const targetWrapper = topMenuBtn.closest('.nav-menu-wrapper') || topMenuBtn;
                targetWrapper.insertAdjacentHTML('beforebegin', html);
            } else if (navActions) {
                navActions.insertAdjacentHTML('afterbegin', html);
            } else {
                // Na stronach bez dedykowanego slotu w navbarze NIE wstrzykujemy dzwonka do body!
                return;
            }

            // Zamknięcie dropdownu po kliknięciu poza niego
            document.addEventListener('click', (e) => {
                const wrapper = document.getElementById('lumina-notification-center');
                if (wrapper && !wrapper.contains(e.target)) {
                    const dd = document.getElementById('notif-dropdown');
                    if (dd) dd.classList.remove('active');
                }
            });
        }

        // 2. Obsługa Paska Push Notification
        updatePushBar() {
            const bar = document.getElementById('notif-push-bar');
            if (!bar) return;

            if ("Notification" in window && Notification.permission === "default") {
                bar.classList.add('show');
                bar.innerHTML = `
                    <span>🔔 Włącz powiadomienia na żywo</span>
                    <button type="button" class="notif-push-enable-btn" onclick="window.requestLuminaPushPermission()">Włącz</button>
                `;
            } else {
                bar.classList.remove('show');
                bar.innerHTML = '';
            }
        }

        // 3a. Sposób C: Kontekstowe Mikro-Zaproszenie (Contextual Push Prompt)
        showContextualPrompt(contextType = 'general', targetName = '', force = false) {
            // Jeśli powiadomienia są już aktywne i to nie jest tryb wymuszony, nie ma potrzeby pytać
            if (!force && ("Notification" in window) && Notification.permission === "granted") return;

            try {
                if (!force) {
                    const dismissed = localStorage.getItem('lumina_push_prompt_dismissed');
                    if (dismissed && (Date.now() - parseInt(dismissed, 10) < 48 * 3600 * 1000)) {
                        return; // Odroczone na 48h (pełna dyskrecja i poszanowanie użytkownika)
                    }
                }
            } catch(e) {}

            const existing = document.getElementById('luminaPushSoftPrompt');
            if (existing) existing.remove();

            let title = '✨ Bądź na bieżąco z Misją';
            let desc = 'Otrzymuj poranne rozważania i wiadomości w społeczności LUMINA.';
            let iconClass = 'fa-solid fa-bell';
            const escapePromptText = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            })[character]);

            if (contextType === 'chat') {
                title = '💬 Powiadomienie o odpowiedzi';
                const safeName = targetName ? `<strong>${escapePromptText(targetName)}</strong>` : 'rozmówca';
                desc = `Chcesz otrzymać powiadomienie na telefon, gdy ${safeName} Ci odpisze?`;
                iconClass = 'fa-solid fa-comments';
            } else if (contextType === 'follow') {
                const safeName = targetName ? `<strong>${escapePromptText(targetName)}</strong>` : 'ten profil';
                title = `✨ Śledź aktywność`;
                desc = `Włącz powiadomienia, gdy ${safeName} doda nowe rozważanie lub wpis.`;
                iconClass = 'fa-solid fa-user-plus';
            } else if (contextType === 'like' || contextType === 'react') {
                title = '❤️ Bądź na bieżąco';
                desc = 'Dowiedz się natychmiast na telefonie, gdy ktoś polubi Twój profil lub odpowie.';
                iconClass = 'fa-solid fa-heart';
            }

            const promptEl = document.createElement('div');
            promptEl.id = 'luminaPushSoftPrompt';
            promptEl.innerHTML = `
                <div class="lumina-push-soft-card">
                    <div class="push-soft-icon">
                        <i class="${iconClass}"></i>
                    </div>
                    <div class="push-soft-content">
                        <div class="push-soft-title">${title}</div>
                        <div class="push-soft-desc">${desc}</div>
                    </div>
                    <div class="push-soft-actions">
                        <button type="button" class="push-soft-btn-enable" onclick="window.handleContextualPushConfirm()">Włącz 🔔</button>
                        <button type="button" class="push-soft-btn-close" onclick="window.LuminaNotifications.dismissSoftPrompt()" title="Nie teraz">✕</button>
                    </div>
                </div>
            `;
            document.body.appendChild(promptEl);

            // BEZ AGRESYWNEGO ZNIKANIA:
            // Czas na spokojne przeczytanie wynosi pełne 60 sekund.
            // Każdy ruch myszką lub dotknięcie palcem na telefonie CAŁKOWICIE ANULUJE timer,
            // dając użytkownikowi 100% kontroli i czasu!
            if (this._contextualPromptTimer) clearTimeout(this._contextualPromptTimer);
            const cancelTimer = () => {
                if (this._contextualPromptTimer) {
                    clearTimeout(this._contextualPromptTimer);
                    this._contextualPromptTimer = null;
                }
            };
            promptEl.addEventListener('mouseenter', cancelTimer);
            promptEl.addEventListener('touchstart', cancelTimer, { passive: true });

            this._contextualPromptTimer = setTimeout(() => {
                const el = document.getElementById('luminaPushSoftPrompt');
                if (el) {
                    el.classList.add('fade-out');
                    setTimeout(() => el.remove(), 300);
                }
            }, 60000);
        }

        initSoftPrompt() {
            // Sposób C: nie atakujemy użytkownika agresywnym popupem przy wejściu
        }

        dismissSoftPrompt() {
            if (this._contextualPromptTimer) {
                clearTimeout(this._contextualPromptTimer);
                this._contextualPromptTimer = null;
            }
            try {
                localStorage.setItem('lumina_push_prompt_dismissed', Date.now().toString());
            } catch(e) {}
            const el = document.getElementById('luminaPushSoftPrompt');
            if (el) {
                el.classList.add('fade-out');
                setTimeout(() => el.remove(), 300);
            }
        }

        // 3b. Uprawnienia Przeglądarki
        async requestBrowserPermission() {
            if (typeof window.requestLuminaPushPermission === 'function') {
                return await window.requestLuminaPushPermission();
            }
            if ("Notification" in window && Notification.permission === "default") {
                try {
                    const perm = await Notification.requestPermission();
                    if (perm === 'granted') {
                        this.push('🔔 Powiadomienia Włączone', 'Będziesz otrzymywać powiadomienia z portalu LUMINA na żywo!', 'lumina_icon.jpg', 'lumina-tablica.html');
                    }
                    this.updatePushBar();
                } catch(e) {}
            }
        }

        // 4. Ładowanie i Zapis Powiadomień
        loadStoredNotifications() {
            try {
                const saved = localStorage.getItem('lumina_inapp_notifications');
                if (saved) {
                    this.notifications = JSON.parse(saved);
                    this.unreadCount = this.notifications.filter(n => n.unread).length;
                } else {
                    this.notifications = [];
                    this.unreadCount = 0;
                }
                this.updateBadge();
                this.renderList();
            } catch(e) {
                this.notifications = [];
                this.unreadCount = 0;
                this.updateBadge();
                this.renderList();
            }
        }

        saveToStorage() {
            try {
                localStorage.setItem('lumina_inapp_notifications', JSON.stringify(this.notifications.slice(0, 50)));
            } catch(e) {}
        }

        // 5. Dodanie Nowego Powiadomienia (z inteligentnym grupowaniem i Rich Cards)
        push(title, body, icon = 'lumina_icon.jpg', actionUrl = 'lumina-tablica.html', playSound = true, groupKey = null) {
            if (groupKey) {
                const existingIndex = this.notifications.findIndex(n => n.groupKey === groupKey);
                if (existingIndex !== -1) {
                    const existing = this.notifications[existingIndex];
                    existing.groupCount = (existing.groupCount || 1) + 1;
                    existing.unread = true;
                    existing.time = 'Przed chwilą';
                    existing.body = `${body} (${existing.groupCount} reakcji)`;
                    this.notifications.splice(existingIndex, 1);
                    this.notifications.unshift(existing);
                    this.updateBadge();
                    this.renderList();
                    this.saveToStorage();
                    if (playSound) this.playChime();
                    return;
                }
            }

            const notif = {
                id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                title,
                body,
                icon: icon || 'lumina_icon.jpg',
                actionUrl: actionUrl || 'lumina-tablica.html',
                time: 'Przed chwilą',
                unread: true,
                groupKey: groupKey || null,
                groupCount: 1
            };

            this.notifications.unshift(notif);
            this.unreadCount++;
            this.updateBadge();
            this.renderList();
            this.saveToStorage();

            if (playSound) this.playChime();

            // Push do przeglądarki jeśli w tle
            if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
                try {
                    const sysNotif = new Notification(title, {
                        body: body,
                        icon: icon || 'lumina_icon.jpg',
                        badge: 'lumina_icon.jpg',
                        tag: groupKey || notif.id
                    });
                    sysNotif.onclick = () => {
                        window.focus();
                        this.handleItemClick(notif.id, notif.actionUrl);
                    };
                } catch(e) {}
            }
        }

        updateBadge() {
            const count = this.unreadCount || 0;
            document.body.setAttribute('data-unread-count', String(count));
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.setAttribute('data-count', String(count));
                if (count > 0) {
                    badge.style.setProperty('display', 'flex', 'important');
                    badge.textContent = count > 9 ? '9+' : String(count);
                } else {
                    badge.style.setProperty('display', 'none', 'important');
                    badge.textContent = '';
                }
            }

            // Sync with mobile bell badge if present
            const mBadge = document.querySelector('.m-nav-notif-badge');
            if (mBadge) {
                mBadge.setAttribute('data-count', String(count));
                if (count > 0) {
                    mBadge.style.setProperty('display', 'flex', 'important');
                    mBadge.textContent = count > 9 ? '9+' : String(count);
                } else {
                    mBadge.style.setProperty('display', 'none', 'important');
                    mBadge.textContent = '';
                }
            }
        }

        renderList() {
            const list = document.getElementById('notif-list');
            const headerActions = document.getElementById('notif-header-actions');
            if (headerActions) {
                headerActions.style.display = this.notifications.length > 0 ? 'flex' : 'none';
            }
            if (!list) return;
            if (this.notifications.length === 0) {
                list.innerHTML = `
                    <div class="notif-empty">
                        <i class="fa-regular fa-bell-slash"></i>
                        <div>Brak nowych powiadomień</div>
                    </div>
                `;
                return;
            }

            list.replaceChildren();
            this.notifications.forEach(n => {
                const row = document.createElement('div');
                row.className = 'notif-item' + (n.unread ? ' unread' : '');
                row.setAttribute('role', 'button');
                row.tabIndex = 0;
                row.innerHTML = '<img class="notif-avatar" alt="" loading="lazy" decoding="async"><div class="notif-content"><div class="notif-item-title"></div><div class="notif-item-body"></div><div class="notif-time"></div></div>';
                const image = row.querySelector('img');
                image.src = safeNotificationUrl(n.icon, '/lumina_icon.jpg');
                image.addEventListener('error', () => { image.src = '/lumina_icon.jpg'; }, { once: true });
                row.querySelector('.notif-item-title').textContent = n.title || '';
                row.querySelector('.notif-item-body').textContent = n.body || '';
                row.querySelector('.notif-time').textContent = n.time || 'Przed chwilą';
                const activate = () => this.handleItemClick(n.id, n.actionUrl || '#');
                row.addEventListener('click', activate);
                row.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
                });
                list.appendChild(row);
            });
        }

        handleItemClick(notifId, url) {
            url = safeNotificationUrl(url, '#', true);
            const item = this.notifications.find(n => n.id === notifId);
            if (item && item.unread) {
                item.unread = false;
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateBadge();
                this.renderList();
                this.saveToStorage();
            }
            if (url && url !== '#') {
                try {
                    const parsedUrl = new URL(url, window.location.href);
                    const openChatUser = parsedUrl.searchParams.get('openChat') || parsedUrl.searchParams.get('chatWith');
                    const openPublic = parsedUrl.searchParams.get('openPublicChat');
                    const msgId = parsedUrl.searchParams.get('messageId') || parsedUrl.searchParams.get('msgId');

                    if (openChatUser && typeof window.openChatWith === 'function') {
                        this.closeDropdown();
                        window.openChatWith(item?.senderName || openChatUser, item?.icon || 'lumina_icon.jpg', openChatUser, msgId);
                        return;
                    } else if (openPublic) {
                        this.closeDropdown();
                        if (typeof window.openDirectMessagesModal === 'function') window.openDirectMessagesModal();
                        if (typeof window.switchMessengerMainTab === 'function') window.switchMessengerMainTab('public');
                        return;
                    }
                } catch(e) {}
                window.location.href = url;
            }
        }

        closeDropdown() {
            const dd = document.getElementById('notif-dropdown');
            if (dd) {
                dd.classList.remove('active');
            }
        }

        toggleDropdown(e) {
            if (e) e.stopPropagation();
            const dd = document.getElementById('notif-dropdown');
            if (dd) {
                dd.classList.toggle('active');
                this.updatePushBar();
            }
        }

        markAllAsRead() {
            this.unreadCount = 0;
            this.notifications.forEach(n => n.unread = false);
            this.updateBadge();
            this.renderList();
            this.saveToStorage();
            if (typeof window.showToast === 'function') {
                window.showToast('Wszystkie powiadomienia oznaczone jako przeczytane! ✨');
            }
        }

        clearAll() {
            this.unreadCount = 0;
            this.notifications = [];
            this.updateBadge();
            this.renderList();
            this.saveToStorage();
            if (typeof window.showToast === 'function') {
                window.showToast('Wyczyszczono listę powiadomień 🗑️');
            }
            // Automatyczne zamknięcie okna powiadomień po wyczyszczeniu
            setTimeout(() => {
                this.closeDropdown();
            }, 350);
        }

        // 6. Podpięcie pod zdarzenia systemowe LUMINA (Dzwonek = WYŁĄCZNIE powiadomienia systemowe)
        
        initFirestoreRealtimeListener() {
            // Dzwonek nie nasłuchuje czatów 1:1 - czaty trafiają wyłącznie do dymka wiadomości
        }

        listenToEvents() {
            window.addEventListener('lumina:coffee_invite', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '☕ Zaproszenie na Chrześcijańską Kawę!',
                    `${det.senderName || 'Użytkownik'} zaprasza Cię na Kawę 🕊️`,
                    det.senderAvatar || 'avatar_new1.jpg',
                    targetUrl,
                    true,
                    `coffee_${sId}`
                );
            });

            window.addEventListener('lumina:amen_reaction', (e) => {
                const det = e.detail || {};
                this.push(
                    '🕊️ Nowe Amen pod Twoim wpisem!',
                    `${det.userName || 'Ktoś'} powiedział Amen pod Twoim świadectwem ✨`,
                    'lumina_icon.jpg',
                    'lumina-tablica.html',
                    true,
                    'amen_reaction'
                );
            });

            window.addEventListener('lumina:profile_like', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '💖 Polubienie profilu!',
                    `${det.senderName || 'Ktoś'} polubił Twój profil w społeczności LUMINA.`,
                    det.senderAvatar || 'lumina_icon.jpg',
                    targetUrl,
                    true,
                    `like_${sId}`
                );
            });

            window.addEventListener('lumina:profile_follow', (e) => {
                const det = e.detail || {};
                const sId = det.senderId || det.senderSlug || 'uzytkownik';
                const targetUrl = `lumina.html?openChat=${encodeURIComponent(sId)}&chatWith=${encodeURIComponent(sId)}`;
                this.push(
                    '🔔 Nowy obserwujący!',
                    `${det.senderName || 'Użytkownik'} zaczął obserwować Twoje wpisy i profil.`,
                    det.senderAvatar || 'lumina_icon.jpg',
                    targetUrl,
                    true,
                    `follow_${sId}`
                );
            });

            window.addEventListener('lumina:notification', (e) => {
                const det = e.detail || {};
                if (det.title) {
                    this.push(det.title, det.body || '', det.icon || 'lumina_icon.jpg', det.actionUrl || 'lumina-tablica.html');
                }
            });
        }
    }

    function safeNotificationUrl(value, fallback, sameOrigin = false) {
        if (typeof value !== 'string' || !value.trim() || value === '#') return fallback;
        try {
            const url = new URL(value, window.location.origin + '/');
            if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return fallback;
            if (sameOrigin && url.origin !== window.location.origin) return fallback;
            return url.href;
        } catch (error) { return fallback; }
    }

    function escapeHtml(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Global helper for firing notifications from anywhere
    window.luminaNotify = function(title, body, icon, actionUrl) {
        if (window.LuminaNotifications && typeof window.LuminaNotifications.push === 'function') {
            window.LuminaNotifications.push(title, body, icon, actionUrl);
        }
    };

    // ── HARMONOGRAM POWIADOMIEŃ PUSH RAMÓWKI CC TV24 ──
    const CC_TV24_NOTIF_SCHEDULE = [
        {
            startHour: 6,
            title: "🌅 Zjednoczeni za Polskę — Na Żywo w CC TV24!",
            body: "Rozpoczynamy pasmo poranne: Modlitwa za Polskę, inspiracje i Słowo Boże na dobry dzień.",
            icon: "tv24_cc.png",
            url: "/master"
        },
        {
            startHour: 10,
            title: "🎵 Biblia Śpiewana & Worship — Na Żywo!",
            body: "Włącz telewizję CC TV24: Śpiewane Przypowieści Salomona i utwory uwielbienia.",
            icon: "Logo_Biblia_Spiewana.jpg",
            url: "/biblia-spiewana"
        },
        {
            startHour: 12,
            title: "📖 Studium Telewizyjne Pisma Świętego",
            body: "Teraz w CC TV24: Głębokie rozważanie Słowa Bożego, wersety i nauczanie biblijne.",
            icon: "studium_logo.png",
            url: "/studium"
        },
        {
            startHour: 14,
            title: "📜 Apokalipsa: Dzień po Dniu — CC TV24",
            body: "Odkrywaj proroctwa i Księgę Nadziei. Transmisja telewizyjna na żywo.",
            icon: "tv24_cc.png",
            url: "/apokalipsa"
        },
        {
            startHour: 16,
            title: "🎶 Codzienne Uwielbienie — Pasmo Muzyczne",
            body: "Codzienne 2 godziny najpiękniejszych pieśni chwały i nowości muzycznych w CC TV24.",
            icon: "tv24_cc.png",
            url: "/codzienne-uwielbienie"
        },
        {
            startHour: 18,
            title: "⚡ Prof. Walter Veith | Totalny Atak — CC TV24",
            body: "Premiera wykładu prof. Waltera Veitha na czas końca. Odkryj prawdę Pisma Świętego!",
            icon: "walter_veith.png",
            url: "/totalny-atak"
        },
        {
            startHour: 20,
            title: "🎬 Kino Chrześcijańskie & Świadectwa Wiary",
            body: "Wieczorny seans filmowy oraz poruszające historie nawróceń i uzdrowień w CC TV24.",
            icon: "tv24_cc.png",
            url: "/kino"
        },
        {
            startHour: 22,
            title: "🕊️ Nocne Czuwanie & Modlitwa 24/7",
            body: "Spokojna noc, relaksacyjna muzyka chwały i wyciszenie przed snem w CC TV24.",
            icon: "tv24_cc.png",
            url: "/czuwanie"
        }
    ];

    function checkAndScheduleTVScheduleNotifications() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Znajdź pozycję z ramówki odpowiadającą bieżącej godzinie
            const slot = CC_TV24_NOTIF_SCHEDULE.find(item => item.startHour === currentHour);
            if (!slot) return;

            const notifKey = `lumina_tv_notif_${slot.startHour}_${todayStr}`;
            const lastSent = localStorage.getItem(notifKey);

            if (!lastSent) {
                localStorage.setItem(notifKey, todayStr);
                if (typeof window.luminaNotify === 'function') {
                    window.luminaNotify(
                        slot.title,
                        slot.body,
                        slot.icon,
                        slot.url
                    );
                }
            }
        } catch (e) {
            console.error('Błąd harmonogramu powiadomień TV24:', e);
        }
    }

    function checkAndScheduleDailyBlessing() {
        try {
            const now = new Date();
            const currentHour = now.getHours();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;

            // Wysyłaj codziennie od godziny 22:00 wzwyż (jeśli nie wysłano dzisiaj)
            if (currentHour >= 22) {
                const lastSentDate = localStorage.getItem('lumina_last_daily_blessing_date');
                if (lastSentDate !== todayStr) {
                    localStorage.setItem('lumina_last_daily_blessing_date', todayStr);
                    if (typeof window.luminaNotify === 'function') {
                        window.luminaNotify(
                            'Błogosławieństwo na Dobranoc 🌙🙏',
                            '„Niech Pan cię błogosławi i strzeże. Niech Pan rozpromieni oblicze swe nad tobą, niech cię obdarzy swą łaską i pokojem.” Spokojnej nocy! ✨🕊️',
                            'lumina_icon.jpg',
                            '#'
                        );
                    }
                }
            }
        } catch (e) {
            console.error('Błąd harmonogramu błogosławieństwa:', e);
        }
    }

    function runAllLuminaSchedulers() {
        checkAndScheduleDailyBlessing();
        checkAndScheduleTVScheduleNotifications();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { 
            window.LuminaNotifications = new LuminaNotificationEngine();

        // Auto-synchronizacja FCM Push Token przy starcie, jeśli uprawnienie jest nadane
        setTimeout(() => {
            if ("Notification" in window && Notification.permission === "granted") {
                if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
                    const curUser = (typeof window.LuminaDB.getCurrentUser === 'function') ? window.LuminaDB.getCurrentUser() : null;
                    const uid = curUser ? (curUser.uid || curUser.slug || curUser.id) : localStorage.getItem('lumina_current_user_slug');
                    window.LuminaDB.requestNotificationPermission(uid).catch(() => {});
                }
            }
        }, 1500);
 
            // Sprawdź przy załadowaniu i powtarzaj co 30 sekund
            setTimeout(runAllLuminaSchedulers, 2500);
            setInterval(runAllLuminaSchedulers, 30000);
        });
    } else {
        window.LuminaNotifications = new LuminaNotificationEngine();
        setTimeout(runAllLuminaSchedulers, 2500);
        setInterval(runAllLuminaSchedulers, 30000);
    }
})();


// ── Globalna funkcja włączenia powiadomień PUSH w telefonie ──
window.requestLuminaPushPermission = async function() {
    try {
        if (!('Notification' in window)) {
            alert('Twoja przeglądarka nie obsługuje powiadomień Push.');
            return false;
        }
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
            const promptEl = document.getElementById('luminaPushSoftPrompt');
            if (promptEl) promptEl.remove();

            if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
                const userSlug = localStorage.getItem('lumina_current_user_slug') || 'anonymous';
                const token = await window.LuminaDB.requestNotificationPermission(userSlug);
                if (!token) throw new Error('Nie udało się zarejestrować telefonu. Zaloguj się i spróbuj ponownie.');
            } else {
                throw new Error('Moduł powiadomień jeszcze się ładuje. Spróbuj ponownie za chwilę.');
            }
            if (window.LuminaNotifications) {
                window.LuminaNotifications.updatePushBar();
                window.LuminaNotifications.push('🔔 Urządzenie zarejestrowane', 'Zgoda i rejestracja urządzenia zostały zapisane. Dostarczenie w tle potwierdza osobny test powiadomienia.', 'lumina_icon.jpg', 'lumina-tablica.html');
            }
            if (typeof window.showLuminaToast === 'function') {
                window.showLuminaToast('🔔 Urządzenie zostało zarejestrowane do powiadomień.');
            } else if (typeof window.showToast === 'function') {
                window.showToast('🔔 Urządzenie zostało zarejestrowane do powiadomień.');
            }
            return true;
        } else {
            const promptEl = document.getElementById('luminaPushSoftPrompt');
            if (promptEl) promptEl.remove();
            return false;
        }
    } catch(e) {
        console.error('Error requesting push permission:', e);
        const message = e.message || 'Nie udało się włączyć powiadomień. Spróbuj ponownie.';
        if (typeof window.showLuminaToast === 'function') window.showLuminaToast(message);
        else if (typeof window.showToast === 'function') window.showToast(message);
        else alert(message);
        return false;
    }
};

// ── Cicha synchronizacja tokena FCM w tle przy starcie ──
window.syncLuminaPushTokenSilently = async function() {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    try {
        if (window.LuminaDB && typeof window.LuminaDB.requestNotificationPermission === 'function') {
            const userSlug = localStorage.getItem('lumina_current_user_slug') || 'anonymous';
            await window.LuminaDB.requestNotificationPermission(userSlug);
        }
    } catch(e) {}
};

// Uruchomienie cichej synchronizacji przy załadowaniu strony
window.addEventListener('lumina-auth-state', () => window.syncLuminaPushTokenSilently());
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(window.syncLuminaPushTokenSilently, 2000));
} else {
    setTimeout(window.syncLuminaPushTokenSilently, 2000);
}

// ── Sposób C: Globalne wywołania mikro-zaproszenia kontekstowego ──
window.showLuminaContextualPushPrompt = function(contextType, targetName, force = false) {
    if (window.LuminaNotifications && typeof window.LuminaNotifications.showContextualPrompt === 'function') {
        window.LuminaNotifications.showContextualPrompt(contextType, targetName, force);
    }
};

window.handleContextualPushConfirm = async function() {
    const promptEl = document.getElementById('luminaPushSoftPrompt');
    if (promptEl) {
        promptEl.classList.add('fade-out');
        setTimeout(() => promptEl.remove(), 300);
    }
    if (typeof window.requestLuminaPushPermission === 'function') {
        const granted = await window.requestLuminaPushPermission();
        if (granted && window.LuminaNotifications) {
            window.LuminaNotifications.push(
                '🔔 Powiadomienia aktywne!',
                'Będziesz teraz otrzymywać natychmiastowe powiadomienia na telefon.',
                'lumina-badge-monochrome.png',
                'lumina.html'
            );
        }
    }
};
