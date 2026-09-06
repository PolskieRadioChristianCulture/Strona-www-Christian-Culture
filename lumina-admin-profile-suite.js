/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA MASTER ADMIN UNIVERSAL PROFILE & USER MANAGEMENT SUITE (lumina-admin-profile-suite.js)
 * Pełny dostęp do edycji, kontroli, blokowania i usuwania każdego profilu w portalu LUMINA.
 * Ekosystem: Christian Culture | Standard: Master Admin Control Suite
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    const ADMIN_PIN_HASH = 'eec0ae2663b74fdb9fb9981e92f1b2cc2a8b42444d358776d872580c79454c91'; // PIN 0455

    // Domena znanych profili systemowych
    const SYSTEM_PROFILES = [
        { slug: 'andrzejthiel', name: 'Andrzej Thiel', role: 'Autor: Cuda Każdego Dnia', type: 'official', verified: true, avatar: 'avatar_andrzej_thiel.jpg' },
        { slug: 'cezaryrgowski', name: 'Cezary Rogowski', role: 'Dyrektor Projektu & Autor', type: 'official', verified: true, avatar: 'avatar_cezary_official.jpg' },
        { slug: 'wiolettarogowska', name: 'Wioletta Rogowska', role: 'Moderator Społeczności & Współzałożycielka', type: 'official', verified: true, avatar: 'avatar_wioletta_official.jpg' },
        { slug: 'studiodobregoslowa', name: 'Studio Dobrego Słowa', role: 'Oficjalny Kanał Audio & Wideo', type: 'channel', verified: true, avatar: 'studiodobregoslowa_avatar.jpg' },
        { slug: 'osobowoscplus', name: 'Osobowość Plus', role: 'Kanał Formacyjny', type: 'channel', verified: true, avatar: 'logo_osobowosc_plus.jpg' },
        { slug: 'radiocc', name: 'Polskie Radio CC', role: 'Główny Nadawca Radiowy', type: 'broadcast', verified: true, avatar: 'logo_radio_cc.jpg' },
        { slug: 'cctv', name: 'Telewizja CCTV', role: 'Oficjalna Telewizja Internetowa', type: 'broadcast', verified: true, avatar: 'logo_cctv.png' },
        { slug: 'ccwomen', name: 'Christian Culture Women', role: 'Społeczność Kobiet', type: 'community', verified: true, avatar: 'avatar_ccwomen_official_2026.jpg', avatarVideo: 'wideo_profilowe_ccwomen.mp4' },
        { slug: 'ccmen', name: 'Christian Culture Men', role: 'Społeczność Mężczyzn', type: 'community', verified: true, avatar: 'logo_cc_men.jpg' },
        { slug: 'u_bibliaaudiochristianculture_3248', name: 'Biblia Audio Christian Culture', role: 'Oficjalny Kanał Biblia Audio CC', type: 'channel', verified: true, avatar: 'avatar_biblia_audio.gif' },
        { slug: 'magdalena', name: 'Magdalena', role: 'Członkini Społeczności', type: 'user', verified: false, avatar: 'avatar_magdalena.jpg' }
    ];

    // Helper: pobiera slug aktualnie przeglądanego profilu
    function detectCurrentProfileSlug() {
        if (window._currentProfileSlug) return window._currentProfileSlug.toLowerCase().trim();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('u')) return urlParams.get('u').toLowerCase().trim();

        const path = window.location.pathname.toLowerCase();
        if (path.includes('andrzejthiel')) return 'andrzejthiel';
        if (path.includes('osobowoscplus')) return 'osobowoscplus';
        if (path.includes('studiodobregoslowa')) return 'studiodobregoslowa';
        if (path.includes('radiocc')) return 'radiocc';
        if (path.includes('cctv')) return 'cctv';
        if (path.includes('ccmen')) return 'ccmen';
        if (path.includes('ccwomen')) return 'ccwomen';
        if (path.includes('wiolettarogowska')) return 'wiolettarogowska';
        if (path.includes('magdalena')) return 'magdalena';
        if (path.includes('cezaryrgowski')) return 'cezaryrgowski';
        return 'profile_default';
    }

    // Sprawdza czy aktywny jest tryb Master Admina (wyłącznie po autoryzacji PIN-em)
    function isUserMasterAdmin() {
        return sessionStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_auth_master_admin') === 'true';
    }

    // Pobiera listę wszystkich zablokowanych profili
    function getBlockedProfiles() {
        try {
            return JSON.parse(localStorage.getItem('lumina_blocked_profiles') || '[]');
        } catch(e) {
            return [];
        }
    }

    // Zapisuje listę zablokowanych profili
    function saveBlockedProfiles(list) {
        localStorage.setItem('lumina_blocked_profiles', JSON.stringify(list));
    }

    // Pobiera listę wszystkich profili (systemowych oraz zarejestrowanych użytkowników)
    function getAllRegisteredProfiles() {
        let all = [...SYSTEM_PROFILES];
        try {
            const extra = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
            extra.forEach(u => {
                if (!all.some(item => item.slug === u.slug)) {
                    all.push(u);
                }
            });

            // Dodatkowo skanuj localStorage w poszukiwaniu dynamicznych profili
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('lumina_profile_')) {
                    const slug = k.replace('lumina_profile_', '');
                    if (slug && !all.some(item => item.slug === slug)) {
                        try {
                            const pData = JSON.parse(localStorage.getItem(k));
                            all.push({
                                slug: slug,
                                name: pData.name || slug,
                                role: pData.job || 'Użytkownik Portalu',
                                type: 'user',
                                verified: !!pData.verified,
                                avatar: localStorage.getItem('lumina_avatar_' + slug) || 'icon.png'
                            });
                        } catch(e) {}
                    }
                }
            }
        } catch(e) {}
        return all;
    }

    // Wstrzykuje style CSS dla HUDa, Szarej Tarczy i Modali
    function injectAdminStyles() {
        if (document.getElementById('luminaAdminSuiteStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaAdminSuiteStyles';
        style.textContent = `
            /* ══════════ TOP NAVBAR & MASTER ADMIN HUD BAR STACKING ══════════ */
            nav.lumina-nav,
            nav.portal-nav,
            nav.profile-navbar,
            .lumina-nav {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 100000 !important;
                height: 56px !important;
            }

            .lumina-admin-hud-bar {
                position: fixed !important;
                top: 56px !important;
                left: 0 !important;
                right: 0 !important;
                z-index: 99999 !important;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 27, 75, 0.98)) !important;
                border-bottom: 2px solid rgba(245, 158, 11, 0.75) !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.85), 0 0 25px rgba(245, 158, 11, 0.25) !important;
                backdrop-filter: blur(16px) !important;
                -webkit-backdrop-filter: blur(16px) !important;
                padding: 8px 16px !important;
                color: #fff !important;
                font-family: 'Plus Jakarta Sans', sans-serif !important;
                display: none;
                transition: all 0.25s ease !important;
            }

            .lumina-admin-hud-bar.active {
                display: block !important;
            }

            .lumina-admin-hud-bar.minimized {
                padding: 5px 16px !important;
            }
            .lumina-admin-hud-bar.minimized .lumina-admin-hud-actions,
            .lumina-admin-hud-bar.minimized .lumina-admin-hud-stats-pill {
                display: none !important;
            }

            body {
                padding-top: 56px !important;
            }
            body.has-admin-hud {
                padding-top: 122px !important;
            }
            body.has-admin-hud.hud-minimized {
                padding-top: 96px !important;
            }

            .lumina-admin-hud-inner {
                max-width: 1300px;
                margin: 0 auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .lumina-admin-hud-header-row {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 12px;
            }

            .lumina-admin-hud-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 0.90rem;
                font-weight: 800;
                color: #facc15;
            }

            .lumina-admin-hud-title .crown-icon {
                font-size: 1.25rem;
                color: #f59e0b;
                filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.7));
            }

            .lumina-admin-hud-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .admin-hud-control-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: #cbd5e1;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                padding: 0;
            }

            .admin-hud-control-btn:hover {
                background: rgba(255, 255, 255, 0.22);
                color: #fff;
                transform: scale(1.1);
            }

            .admin-hud-control-btn.btn-close-admin {
                background: rgba(239, 68, 68, 0.2);
                border-color: rgba(239, 68, 68, 0.5);
                color: #fca5a5;
            }

            .admin-hud-control-btn.btn-close-admin:hover {
                background: #ef4444;
                border-color: #ef4444;
                color: #fff;
                box-shadow: 0 0 14px rgba(239, 68, 68, 0.6);
            }

            /* Minimized HUD State */
            .lumina-admin-hud-bar.minimized {
                padding: 6px 16px;
                background: rgba(15, 23, 42, 0.95);
                border-bottom: 1.5px solid rgba(245, 158, 11, 0.4);
            }
            .lumina-admin-hud-bar.minimized .lumina-admin-hud-actions {
                display: none !important;
            }
            .lumina-admin-hud-bar.minimized .lumina-admin-hud-inner {
                gap: 0;
            }

            .lumina-admin-hud-actions {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }

            .admin-suite-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 7px 13px;
                border-radius: 20px;
                font-size: 0.80rem;
                font-weight: 700;
                font-family: inherit;
                cursor: pointer;
                border: 1px solid rgba(255, 255, 255, 0.15);
                background: rgba(255, 255, 255, 0.08);
                color: #e2e8f0;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                text-decoration: none;
            }

            .admin-suite-btn:hover {
                transform: translateY(-1px);
                background: rgba(255, 255, 255, 0.18);
                color: #fff;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .admin-suite-btn.btn-gold {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                color: #000;
                font-weight: 800;
                border: none;
                box-shadow: 0 2px 10px rgba(245, 158, 11, 0.35);
            }
            .admin-suite-btn.btn-gold:hover {
                box-shadow: 0 4px 16px rgba(245, 158, 11, 0.55);
            }

            .admin-suite-btn.btn-cyan {
                background: rgba(6, 182, 212, 0.18);
                border-color: rgba(6, 182, 212, 0.4);
                color: #67e8f9;
            }
            .admin-suite-btn.btn-cyan:hover {
                background: rgba(6, 182, 212, 0.3);
                color: #fff;
            }

            .admin-suite-btn.btn-purple {
                background: rgba(168, 85, 247, 0.18);
                border-color: rgba(168, 85, 247, 0.4);
                color: #d8b4fe;
            }
            .admin-suite-btn.btn-purple:hover {
                background: rgba(168, 85, 247, 0.3);
                color: #fff;
            }

            .admin-suite-btn.btn-danger {
                background: rgba(239, 68, 68, 0.18);
                border-color: rgba(239, 68, 68, 0.4);
                color: #fca5a5;
            }
            .admin-suite-btn.btn-danger:hover {
                background: rgba(239, 68, 68, 0.35);
                color: #fff;
            }

            .admin-suite-btn.btn-warn {
                background: rgba(249, 115, 22, 0.18);
                border-color: rgba(249, 115, 22, 0.4);
                color: #fdba74;
            }
            .admin-suite-btn.btn-warn:hover {
                background: rgba(249, 115, 22, 0.35);
                color: #fff;
            }

            /* ── Inline Edit Badges & Pencil Triggers ── */
            .admin-inline-edit-btn {
                display: none;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: rgba(245, 158, 11, 0.2);
                border: 1px solid rgba(245, 158, 11, 0.45);
                color: #facc15;
                font-size: 0.78rem;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 8px;
                vertical-align: middle;
            }

            body.lumina-admin-mode .admin-inline-edit-btn {
                display: inline-flex !important;
            }

            .admin-inline-edit-btn:hover {
                background: #f59e0b;
                color: #000;
                transform: scale(1.15);
                box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
            }

            /* ══════════ JEDYNA DYSKRETNA TARCZA ADMINA Z WERSJĄ (LEWY DOLNY RÓG) ══════════ */
            .lumina-admin-shield-container { display: none !important; }
            .lumina-admin-floating-shield {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: transparent;
                border: none;
                color: #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.88rem;
                cursor: pointer;
                padding: 0;
                transition: all 0.25s ease;
            }
            .lumina-admin-shield-container:hover .lumina-admin-floating-shield {
                color: #facc15;
                transform: scale(1.1);
            }
            .lumina-admin-version-tag {
                font-size: 0.72rem;
                font-weight: 700;
                color: rgba(148, 163, 184, 0.75);
                font-family: 'Plus Jakarta Sans', sans-serif;
                letter-spacing: 0.2px;
                transition: color 0.25s ease;
            }
            .lumina-admin-shield-container:hover .lumina-admin-version-tag {
                color: #e2e8f0;
            }
            /* Odblokowana / Zalogowany Master Admin */
            .lumina-admin-shield-container.unlocked {
                border-color: rgba(16, 185, 129, 0.5);
                background: rgba(15, 23, 42, 0.8);
            }
            .lumina-admin-shield-container.unlocked .lumina-admin-floating-shield {
                color: #10b981;
            }
            .lumina-admin-shield-container.unlocked .lumina-admin-version-tag {
                color: #34d399;
            }

            /* Banner blokady użytkownika */
            .lumina-user-blocked-banner {
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(153, 27, 27, 0.35));
                border: 1.5px solid #ef4444;
                color: #fca5a5;
                padding: 12px 18px;
                border-radius: 14px;
                margin-bottom: 18px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 700;
                font-size: 0.90rem;
            }

            /* ══════════ AGENT INSPECTOR & NOTA DLA AGENTA ══════════ */
            body.lumina-agent-inspector-active * {
                cursor: crosshair !important;
            }

            .lumina-agent-hover-target {
                outline: 2.5px dashed #10b981 !important;
                outline-offset: 3px !important;
                background: rgba(16, 185, 129, 0.12) !important;
                box-shadow: 0 0 16px rgba(16, 185, 129, 0.45) !important;
                transition: outline 0.1s ease !important;
            }

            /* ══════════ DOCKED INSPECTOR BANNER (DOKLEJONY DO PANELU MASTER ADMIN) ══════════ */
            .lumina-inspector-banner {
                position: fixed;
                top: 108px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99998;
                background: linear-gradient(135deg, rgba(6, 78, 59, 0.98), rgba(4, 120, 87, 0.98));
                border: 1.5px solid #34d399;
                border-top: none;
                color: #fff;
                padding: 6px 18px;
                border-radius: 0 0 20px 20px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(52, 211, 153, 0.35);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                animation: slideDown 0.25s ease;
                font-family: 'Plus Jakarta Sans', sans-serif;
                max-width: 92vw;
                width: auto;
                transition: top 0.2s ease, padding 0.2s ease;
            }

            .lumina-inspector-banner.minimized {
                padding: 4px 12px;
                border-radius: 0 0 16px 16px;
            }
            .lumina-inspector-banner.minimized .lumina-inspector-hint {
                display: none !important;
            }

            .lumina-inspector-banner-inner {
                display: flex;
                align-items: center;
                gap: 12px;
                justify-content: center;
            }

            .lumina-inspector-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(52, 211, 153, 0.6);
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 0.80rem;
                font-weight: 800;
                color: #a7f3d0;
                letter-spacing: 0.3px;
                white-space: nowrap;
            }

            .lumina-inspector-hint {
                font-size: 0.82rem;
                font-weight: 600;
                color: #ecfdf5;
                white-space: nowrap;
            }

            .lumina-inspector-controls {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .lumina-inspector-control-btn {
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.25);
                color: #fff;
                font-weight: 700;
                font-size: 0.78rem;
                padding: 4px 10px;
                border-radius: 16px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                transition: all 0.2s ease;
                white-space: nowrap;
            }

            .lumina-inspector-control-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: #fff;
            }

            .lumina-inspector-control-btn.btn-exit-insp:hover {
                background: #ef4444;
                border-color: #ef4444;
            }

            @media (max-width: 768px) {
                .lumina-admin-hud-inner {
                    flex-direction: column;
                    align-items: stretch;
                }
                .lumina-admin-hud-actions {
                    justify-content: flex-start;
                }
                .lumina-admin-shield-container {
                    bottom: 85px;
                    left: 14px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Inicjuje strukturę DOM dla panelu administracyjnego
    function injectAdminDOM(slug) {
        if (document.getElementById('luminaAdminSuiteContainer')) return;

        const container = document.createElement('div');
        container.id = 'luminaAdminSuiteContainer';
        container.innerHTML = `
            <!-- Top Master Admin HUD Bar -->
            <div class="lumina-admin-hud-bar" id="luminaAdminHudBar">
                <div class="lumina-admin-hud-inner">
                    <div class="lumina-admin-hud-header-row">
                        <div class="lumina-admin-hud-title" onclick="window.LuminaAdminSuite.toggleMinimizeHud()" style="cursor:pointer;" title="Kliknij, aby zwinąć / rozwinąć pasek opcji">
                            <i class="fa-solid fa-crown crown-icon"></i>
                            <span>MASTER ADMIN • Aktywny Profil: <b id="hudTargetName">${slug}</b></span>
                        </div>
                        <div class="lumina-admin-hud-controls">
                            <button type="button" 
                                    id="hudBtnMinimize" 
                                    class="admin-hud-control-btn" 
                                    onclick="window.LuminaAdminSuite.toggleMinimizeHud()" 
                                    title="Minimalizuj / Rozwiń pasek Administratora"
                                    aria-label="Minimalizuj pasek">
                                <i class="fa-solid fa-minus" id="hudMinimizeIcon"></i>
                            </button>
                            <button type="button" 
                                    class="admin-hud-control-btn btn-close-admin" 
                                    onclick="window.LuminaAdminSuite.lockAdminMode()" 
                                    title="Zamknij i wyjdź z panelu Administratora (Wyloguj)"
                                    aria-label="Wyjdź z trybu Administratora">
                                <i class="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    </div>
                    <div class="lumina-admin-hud-actions" id="luminaAdminHudActions">
                        <button type="button" class="admin-suite-btn" style="background:linear-gradient(135deg, #7c3aed, #2563eb); border:1px solid rgba(139,92,246,0.6); color:#fff; font-weight:800; box-shadow:0 2px 14px rgba(124,58,237,0.45);" onclick="window.LuminaAdminSuite.openCommanderAiChatModal()" title="Otwórz bezpośredni czat błyskawiczny Dowódcy z Agentem AI Antigravity">
                            <i class="fa-solid fa-bolt"></i> ⚡ Wiadomość Błyskawiczna do Agenta
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" onclick="window.LuminaAdminSuite.openFullEditor()">
                            <i class="fa-solid fa-pen-to-square"></i> Edytuj Profil
                        </button>
                        <button type="button" class="admin-suite-btn" style="background:linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; font-weight:800; box-shadow:0 2px 10px rgba(16, 185, 129, 0.45);" onclick="window.LuminaAdminSuite.toggleAgentInspector()" title="Włącz tryb celownika: wskaż element i dodaj notę dla Agenta">
                            <i class="fa-solid fa-crosshairs"></i> 🎯 Nota dla Agenta
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" onclick="window.LuminaAdminSuite.openAllProfilesManager()">
                            <i class="fa-solid fa-users-gear"></i> Menedżer Wszystkich Profili
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="window.LuminaAdminSuite.runSelfRepair()" title="Uruchom autonaprawę i diagnostykę systemu">
                            <i class="fa-solid fa-wrench"></i> Auto-Naprawa & Zdrowie
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="document.getElementById('adminAvatarFileInput').click()" title="Zmień awatar dla tego profilu">
                            <i class="fa-solid fa-camera"></i> Awatar
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" onclick="if(window.LuminaPremiumAvatar) window.LuminaPremiumAvatar.openModal(window.LuminaAdminSuite.slug)" title="10-sekundowe Wideo Profilowe (Premium / Patron CC)">
                            <i class="fa-solid fa-video"></i> 10s Wideo Profilowe
                        </button>
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="document.getElementById('adminCoverFileInput').click()" title="Zmień tło">
                            <i class="fa-solid fa-panorama"></i> Tło
                        </button>
                        
                        <button type="button" class="admin-suite-btn btn-cyan" onclick="window.LuminaAdminSuite.openPushNotificationModal()">
                            <i class="fa-solid fa-bell"></i> Powiadomienia PUSH
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" onclick="window.LuminaAdminSuite.openNewPostModal()">
                            <i class="fa-solid fa-plus"></i> Nowy Wpis
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" onclick="if(window.LuminaMediaReplacer) { window.LuminaMediaReplacer.scanAndAttachButtons(); if(typeof window.showToast==='function') window.showToast('🔍 Kliknij przycisk Wymień przy pliku lub grafice!'); }" title="Wymień dowolny plik/multimedia na link z Dysku Google lub YouTube (Zero-Egress Standard)">
                            <i class="fa-solid fa-arrows-rotate"></i> Wymień Plik (Dysk/YT)
                        </button>
                        <button type="button" class="admin-suite-btn btn-warn" id="hudBtnToggleBlock" onclick="window.LuminaAdminSuite.toggleBlockCurrentProfile()">
                            <i class="fa-solid fa-ban"></i> Zablokuj Profil
                        </button>
                        <button type="button" class="admin-suite-btn btn-danger" onclick="window.LuminaAdminSuite.deleteCurrentProfileConfirm()">
                            <i class="fa-solid fa-trash-can"></i> Usuń Profil
                        </button>
                        <button type="button" class="admin-suite-btn" style="background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.2);" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu administratora i przywróć szarą tarczę">
                            <i class="fa-solid fa-lock"></i> Wyloguj
                        </button>
                    </div>
                </div>
            </div>

            <!-- Dyskretna Tarcza Administratora z Numerem Wersji (Tylko jedna, lewy dolny róg) -->
            <div id="luminaFloatingAdminShieldContainer" class="lumina-admin-shield-container">
                <button type="button" 
                        id="luminaFloatingAdminShield" 
                        class="lumina-admin-floating-shield" 
                        onclick="window.LuminaAdminSuite.openPinPrompt()" 
                        title="Panel Administratora Portalu" 
                        aria-label="Panel Administratora">
                    <i class="fa-solid fa-shield-halved"></i>
                </button>
                <span class="lumina-admin-version-tag">v4.0.0</span>
            </div>

            <!-- Ukryte kontrolki uploadu plików -->
            <input type="file" id="adminAvatarFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleAvatarSelect(event)">
            <input type="file" id="adminCoverFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleCoverSelect(event)">
            <input type="file" id="adminGalleryFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleGallerySelect(event)">
            <input type="file" id="adminPostImgFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handlePostImgSelect(event)">

            <!-- ══════════ MODAL 1: PEŁNA EDYCJA DANYCH PROFILU ══════════ -->
            <div class="modal-overlay" id="adminUniversalProfileModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')">
                <div class="modal-card" style="max-width: 620px; background: #0b142e; border: 1.5px solid rgba(245, 158, 11, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(245, 158, 11, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); justify-content:space-between; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:#000; font-size:1.3rem; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                                <i class="fa-solid fa-user-pen"></i>
                            </div>
                            <div>
                                <h3 id="adminModalProfileTitle" style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Edycja Profilu • Master Admin</h3>
                                <div style="font-size:0.75rem; color:#facc15; font-weight:700;">Zmień dowolne dane, teksty, werset, bio, status weryfikacji i uprawnienia</div>
                            </div>
                        </div>
                        <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 14px; border-radius:14px; font-size:12px; margin-right:34px;" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu Administratora">
                            <i class="fa-solid fa-lock"></i> Wyloguj Admina
                        </button>
                    </div>

                    <form id="adminUniversalProfileForm" onsubmit="window.LuminaAdminSuite.saveProfileSubmit(event)">
                        <input type="hidden" id="adminTargetSlugHidden" value="">

                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Imię i Nazwisko / Tytuł Profilu</label>
                                <input type="text" id="adminInputName" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;" required>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Wiek / Etykieta</label>
                                <input type="text" id="adminInputAge" placeholder="np. 70 lat" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Lokalizacja / Miasto</label>
                                <input type="text" id="adminInputCity" placeholder="np. Sieradz, Polska" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Data Urodzenia / Urodziny</label>
                                <input type="text" id="adminInputBirth" placeholder="np. 30 listopada 1955" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Rola / Zawód / Misja</label>
                                <input type="text" id="adminInputJob" placeholder="np. Autor: Cuda Każdego Dnia" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;">
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Wspólnota / Kościół / Wyznanie</label>
                                <input type="text" id="adminInputChurch" placeholder="np. Kościół Chrześcijański" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#38bdf8; margin-bottom:4px;"><i class="fa-solid fa-circle-check"></i> Status Weryfikacji (Odznaka)</label>
                                <select id="adminInputVerified" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                                    <option value="true" style="background:#0f172a;">Zweryfikowany / Oficjalny (Niebieski Ptaszek)</option>
                                    <option value="false" style="background:#0f172a;">Standardowy Użytkownik</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#a855f7; margin-bottom:4px;"><i class="fa-solid fa-lock"></i> Widoczność Profilu</label>
                                <select id="adminInputPrivacy" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                                    <option value="public" style="background:#0f172a;">Publiczny (Dostępny dla Wszystkich)</option>
                                    <option value="private" style="background:#0f172a;">Prywatny (Tylko dla Zalogowanych / Znajomych)</option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#facc15; margin-bottom:4px;"><i class="fa-solid fa-book-bible"></i> Główny Werset Biblijny</label>
                            <textarea id="adminInputVerse" rows="2" placeholder="Treść wersetu biblijnego..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                            <input type="text" id="adminInputVerseRef" placeholder="np. — Ewangelia wg św. Jana 15, 5" style="width:100%; margin-top:6px; padding:8px 12px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); color:#facc15; font-family:inherit; font-size:13px; font-weight:700;">
                        </div>

                        <div style="margin-bottom:12px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.25); border-radius:14px; padding:12px 14px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="font-size:0.75rem; font-weight:800; color:#facc15;"><i class="fa-solid fa-video"></i> 10-Sekundowe Wideo Profilowe (Premium / Patron CC)</label>
                                <button type="button" onclick="if(window.LuminaPremiumAvatar) window.LuminaPremiumAvatar.openModal(document.getElementById('adminTargetSlugHidden').value || window.LuminaAdminSuite.slug)" style="background:linear-gradient(135deg,#f59e0b,#ec4899); border:none; color:#fff; font-size:0.72rem; font-weight:800; padding:4px 10px; border-radius:10px; cursor:pointer;">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Kreator Wideo 10s
                                </button>
                            </div>
                            <input type="text" id="adminInputVideoAvatar" placeholder="Link YouTube (np. https://www.youtube.com/watch?v=...) lub bezpośredni link MP4" style="width:100%; padding:9px 12px; border-radius:10px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13px;">
                            <div style="font-size:0.70rem; color:#94a3b8; margin-top:4px;">Wyświetla się w miejscu zdjęcia profilowego (obsługuje filmy YouTube oraz pliki MP4/WebM).</div>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">O Mnie / Świadectwo / Misja</label>
                            <textarea id="adminInputBio" rows="3" placeholder="Opis profilu, świadectwo lub misja..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tagi i Zainteresowania (oddzielone przecinkami)</label>
                            <input type="text" id="adminInputTags" placeholder="np. 📖 Cuda Każdego Dnia, 🕊️ Duch Święty, 🙏 Modlitwa" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px;">
                        </div>

                        <div style="display:flex; gap:10px; justify-content:space-between; align-items:center;">
                            <button type="button" onclick="window.LuminaAdminSuite.lockAdminMode()" style="padding:10px 16px; border-radius:24px; background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:#fca5a5; font-weight:700; cursor:pointer;" title="Wyloguj z trybu Administratora">
                                <i class="fa-solid fa-lock"></i> Wyloguj
                            </button>
                            <div style="display:flex; gap:10px;">
                                <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminUniversalProfileModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                                <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(245,158,11,0.4);">
                                    <i class="fa-solid fa-check"></i> Zapisz Zmiany w Profilu
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ══════════ MODAL 2: MENEDŻER WSZYSTKICH PROFILI (CONTROL CENTER) ══════════ -->
            <div class="modal-overlay" id="adminAllProfilesModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminAllProfilesModal')">
                <div class="modal-card" style="max-width: 820px; width: 95%; max-height: 88vh; background: #080e22; border: 1.5px solid rgba(168, 85, 247, 0.5); box-shadow: 0 25px 70px rgba(0,0,0,0.9), 0 0 40px rgba(168, 85, 247, 0.25); border-radius: 24px; padding: 24px; position: relative; display: flex; flex-direction: column; overflow: hidden;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminAllProfilesModal')" aria-label="Zamknij" style="position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #6366f1); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem; box-shadow:0 4px 14px rgba(168,85,247,0.4);">
                                <i class="fa-solid fa-users-gear"></i>
                            </div>
                            <div>
                                <h3 style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Zarządzanie Wszystkimi Profilami & Kontami</h3>
                                <div style="font-size:0.75rem; color:#c084fc; font-weight:700;">Nadrzędna kontrola, edycja, blokowanie (ban) i usuwanie profili</div>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-right:34px;">
                            <button type="button" class="admin-suite-btn" style="background:rgba(239, 68, 68, 0.2); border:1.5px solid #ef4444; color:#fca5a5; font-weight:800; padding:8px 16px; border-radius:20px; display:inline-flex; align-items:center; gap:6px;" onclick="window.LuminaAdminSuite.lockAdminMode()" title="Wyloguj z trybu administratora i przywróć szarą tarczę">
                                <i class="fa-solid fa-lock"></i> Wyloguj z Admina
                            </button>
                            <button type="button" class="admin-suite-btn btn-gold" onclick="window.LuminaAdminSuite.promptCreateNewProfile()">
                                <i class="fa-solid fa-user-plus"></i> Dodaj Profil
                            </button>
                        </div>
                    </div>

                    <!-- Wyszukiwarka profili -->
                    <div style="margin-bottom:14px;">
                        <input type="text" id="adminProfilesSearchInput" placeholder="🔍 Szukaj profilu (imię, slug, rola, miasto)..." oninput="window.LuminaAdminSuite.renderProfilesListInModal(this.value)" style="width:100%; padding:10px 16px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                    </div>

                    <!-- Lista profili (przewijana) -->
                    <div id="adminProfilesListContainer" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 4px;">
                        <!-- Generowane dynamicznie przez renderProfilesListInModal -->
                    </div>

                    <!-- Pasek Statusu i Wylogowania na dole -->
                    <div style="margin-top:14px; padding-top:12px; border-top:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#94a3b8; flex-wrap:wrap; gap:8px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 8px #10b981;"></span>
                            <span>Status: <b style="color:#34d399;">Zalogowano jako Główny Administrator</b></span>
                        </div>
                        <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 14px; border-radius:14px;" onclick="window.LuminaAdminSuite.lockAdminMode()">
                            <i class="fa-solid fa-right-from-bracket"></i> Wyloguj i zablokuj tarczę
                        </button>
                    </div>
                </div>
            </div>

            <!-- ══════════ MODAL 3: PUBLIKACJA / EDYCJA WPISU ══════════ -->
            <div class="modal-overlay" id="adminUniversalPostModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminUniversalPostModal')">
                <div class="modal-card" style="max-width: 600px; background: #0b142e; border: 1.5px solid rgba(168, 85, 247, 0.45); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(168, 85, 247, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminUniversalPostModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #a855f7, #7c3aed); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.3rem; box-shadow:0 4px 14px rgba(168,85,247,0.4);">
                            <i class="fa-solid fa-pen-nib"></i>
                        </div>
                        <div>
                            <h3 id="adminPostModalHeaderTitle" style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Nowa Publikacja / Rozważanie</h3>
                            <div style="font-size:0.75rem; color:#c084fc; font-weight:700;">Wpis pojawi się na profilu i automatycznie na Tablicy LUMINA</div>
                        </div>
                    </div>

                    <form id="adminUniversalPostForm" onsubmit="window.LuminaAdminSuite.savePostSubmit(event)">
                        <input type="hidden" id="adminEditPostId" value="">

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Nagłówek Serii / Etykieta (np. CUDA KAŻDEGO DNIA!)</label>
                            <input type="text" id="adminPostSeries" placeholder="np. CUDA KAŻDEGO DNIA! • Dzisiejsze Słowo" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; font-weight:700;">
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tytuł Wpisu</label>
                            <input type="text" id="adminPostTitle" placeholder="Tytuł rozważania lub wpisu..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:15px; font-weight:800;" required>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Treść Rozważania / Wpisu</label>
                            <textarea id="adminPostContent" rows="5" placeholder="Napisz treść rozważania, refleksję biblijną lub świadectwo..." style="width:100%; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; line-height:1.6; resize:vertical;" required></textarea>
                        </div>

                        <div style="margin-bottom:12px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#facc15; margin-bottom:4px;"><i class="fa-solid fa-hands-praying"></i> Blok Modlitwy / Cytatu (Opcjonalnie)</label>
                            <textarea id="adminPostPrayer" rows="2" placeholder="Wpisz słowa modlitwy podsumowującej..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;"></textarea>
                        </div>

                        <div style="margin-bottom:18px;">
                            <button type="button" onclick="document.getElementById('adminPostImgFileInput').click()" style="padding:8px 14px; border-radius:12px; background:rgba(255,255,255,0.08); border:1px dashed rgba(255,255,255,0.25); color:#cbd5e1; font-family:inherit; font-size:0.82rem; cursor:pointer;">
                                <i class="fa-solid fa-image"></i> Dołącz Zdjęcie do Wpisu
                            </button>
                            <div id="adminPostImgPreviewBox" style="display:none; margin-top:8px;">
                                <img id="adminPostImgPreview" src="" alt="Podgląd" style="max-height:140px; border-radius:10px; border:1px solid rgba(255,255,255,0.2);">
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminUniversalPostModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                            <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #a855f7, #7c3aed); border:none; color:#fff; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(168,85,247,0.4);">
                                <i class="fa-solid fa-paper-plane"></i> Opublikuj Wpis
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            
            <!-- ══════════ MODAL 5: KREATOR POWIADOMIEŃ PUSH ══════════ -->
            <div class="modal-overlay" id="adminPushNotificationModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminPushNotificationModal')">
                <div class="modal-card" style="max-width: 620px; width: 92%; max-height: 88vh; overflow-y: auto; background: #0b142e; border: 1.5px solid rgba(245, 158, 11, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.85), 0 0 35px rgba(245, 158, 11, 0.2); border-radius: 24px; padding: 26px 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminPushNotificationModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                    
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #d97706); display:flex; align-items:center; justify-content:center; color:#000; font-size:1.3rem; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                            <i class="fa-solid fa-bell"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Zarządzanie Powiadomieniami PUSH</h3>
                            <div style="font-size:0.75rem; color:#facc15; font-weight:700;">Wysyłaj globalne powiadomienia do całej społeczności LUMINA</div>
                        </div>
                    </div>

                    <form id="adminPushNotificationForm" onsubmit="window.LuminaAdminSuite.submitPushNotification(event)">
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Tytuł Powiadomienia</label>
                            <input type="text" id="adminPushTitle" placeholder="np. Nowy wpis od Andrzeja T!" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; font-weight:700;" required>
                        </div>
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Treść Powiadomienia (Message)</label>
                            <textarea id="adminPushContent" rows="3" placeholder="Wpisz treść powiadomienia..." style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13.5px; resize:vertical;" required></textarea>
                        </div>
                        
                        
                        <div style="margin-bottom:14px;">
                            <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Odbiorcy Powiadomienia (Grupa Docelowa)</label>
                            <select id="adminPushAudience" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;" required>
                                <option value="all">Wszyscy użytkownicy portalu (Global)</option>
                                <option value="logged_in">Tylko Zalogowani Użytkownicy</option>
                                <option value="donors">Tylko Wspierający / Darczyńcy (Premium)</option>
                            </select>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Przycisk Akcji (CTA)</label>
                                <select id="adminPushActionType" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;" required>
                                    <option value="czytaj">Czytaj</option>
                                    <option value="ogladaj">Oglądaj</option>
                                    <option value="udostepnij">Udostępnij</option>
                                    <option value="wspieraj">Wspieraj</option>
                                    <option value="amen">Amen</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Link Akcji (Gdzie ma prowadzić?)</label>
                                <input type="text" id="adminPushActionLink" placeholder="np. lumina-tablica.html" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px;">
                            </div>
                        </div>

                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 14px; margin-bottom: 18px;">
                            <h4 style="margin:0 0 10px 0; font-size:0.9rem; color:#facc15;">Harmonogram Wysyłki</h4>
                            <div style="display:flex; gap:14px; margin-bottom:12px;">
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.85rem; color:#fff;">
                                    <input type="radio" name="adminPushScheduleType" value="once" checked onchange="document.getElementById('adminPushRecurringOpts').style.display='none'"> 
                                    Wyślij natychmiast (Raz)
                                </label>
                                <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:0.85rem; color:#fff;">
                                    <input type="radio" name="adminPushScheduleType" value="recurring" onchange="document.getElementById('adminPushRecurringOpts').style.display='block'"> 
                                    Wysyłaj cyklicznie
                                </label>
                            </div>
                            
                            <div id="adminPushRecurringOpts" style="display:none; padding-top:10px; border-top:1px dashed rgba(255,255,255,0.1);">
                                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                                    <div>
                                        <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Interwał (Częstotliwość)</label>
                                        <select id="adminPushInterval" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:13px;">
                                            <option value="weekly">Raz w tygodniu</option>
                                            <option value="twice_weekly">Dwa razy w tygodniu</option>
                                            <option value="monthly">Raz w miesiącu</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style="display:block; font-size:0.75rem; font-weight:700; color:#94a3b8; margin-bottom:4px;">Godzina Wysyłania</label>
                                        <input type="time" id="adminPushTime" value="12:00" style="width:100%; padding:10px 14px; border-radius:12px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; color-scheme:dark;">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="display:flex; gap:10px; justify-content:flex-end;">
                            <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminPushNotificationModal')" style="padding:11px 20px; border-radius:24px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">Anuluj</button>
                            <button type="submit" style="padding:11px 26px; border-radius:24px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; font-weight:800; cursor:pointer; box-shadow:0 4px 16px rgba(245,158,11,0.4);">
                                <i class="fa-solid fa-paper-plane"></i> Zatwierdź / Wyślij PUSH
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ══════════ MODAL 4: MENU TAJNEJ TARCZY ADMINISTRATORA ══════════ -->
            <div class="modal-overlay" id="adminShieldQuickModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminShieldQuickModal')">
                <div class="modal-card" style="max-width: 440px; width: 92%; background: #0b142e; border: 1.5px solid rgba(16, 185, 129, 0.5); box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(16, 185, 129, 0.25); border-radius: 24px; padding: 24px; position: relative;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #10b981, #059669); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.3rem; box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit', sans-serif; font-size:1.20rem; font-weight:800; color:#fff; margin:0;">Tajna Tarcza Administratora</h3>
                            <div style="font-size:0.75rem; color:#34d399; font-weight:700;">Status: Zalogowany Master Admin</div>
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
                        <button type="button" class="admin-suite-btn" style="background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-weight:800; justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px; box-shadow:0 4px 14px rgba(16,185,129,0.4);" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.activateAgentInspector();">
                            <i class="fa-solid fa-crosshairs" style="font-size:1.1rem; width:22px;"></i> 🎯 Nota dla Agenta (Wskaż element)
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openAllProfilesManager();">
                            <i class="fa-solid fa-users-gear" style="font-size:1.1rem; width:22px;"></i> Menedżer Wszystkich Profili
                        </button>
                        <button type="button" class="admin-suite-btn btn-gold" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openFullEditor();">
                            <i class="fa-solid fa-pen-to-square" style="font-size:1.1rem; width:22px;"></i> Edytuj Aktywny Profil (<b id="quickModalSlugName">${slug}</b>)
                        </button>
                        
                        <button type="button" class="admin-suite-btn btn-cyan" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openPushNotificationModal();">
                            <i class="fa-solid fa-bell" style="font-size:1.1rem; width:22px;"></i> Powiadomienia PUSH
                        </button>
                        <button type="button" class="admin-suite-btn btn-purple" style="justify-content:flex-start; padding:12px 16px; border-radius:14px; font-size:14px;" onclick="window.LuminaAdminSuite.closeModal('adminShieldQuickModal'); window.LuminaAdminSuite.openNewPostModal();">
                            <i class="fa-solid fa-plus" style="font-size:1.1rem; width:22px;"></i> Nowy Wpis / Słowo Dnia
                        </button>
                    </div>

                    <div style="padding-top:14px; border-top:1px solid rgba(255,255,255,0.1); display:flex; flex-direction:column; gap:8px;">
                        <button type="button" class="admin-suite-btn btn-danger" style="justify-content:center; padding:12px 16px; border-radius:16px; font-size:14px; font-weight:800; width:100%; box-shadow:0 4px 16px rgba(239,68,68,0.35);" onclick="window.LuminaAdminSuite.lockAdminMode()">
                            <i class="fa-solid fa-lock"></i> Wyloguj i Zablokuj Tarczę (Szara)
                        </button>
                        <div style="font-size:0.72rem; color:#94a3b8; text-align:center; margin-top:2px;">
                            Po wylogowaniu tarcza powróci do szarego koloru i zablokuje uprawnienia.
                        </div>
                    </div>
                </div>
            </div>

            <!-- ══════════ PŁYWAJĄCY PASEK TRYBU CELOWNIKA (NOTA DLA AGENTA) ══════════ -->
            <div id="luminaAgentInspectorBanner" class="lumina-inspector-banner" style="display:none;">
                <div class="lumina-inspector-banner-inner">
                    <div class="lumina-inspector-badge">
                        <i class="fa-solid fa-crosshairs fa-spin" style="--fa-animation-duration: 4s;"></i> CELOWNIK (@N)
                    </div>
                    <div class="lumina-inspector-hint">
                        Kliknij <b>dowolny element</b>, aby dodać notę dla Agenta.
                    </div>
                    <div class="lumina-inspector-controls">
                        <button type="button" class="lumina-inspector-control-btn" onclick="window.LuminaAdminSuite.toggleMinimizeInspectorBanner()" title="Zwiń / Rozwiń pasek">
                            <i class="fa-solid fa-minus" id="inspectorMinimizeIcon"></i>
                        </button>
                        <button type="button" class="lumina-inspector-control-btn btn-exit-insp" onclick="window.LuminaAdminSuite.deactivateAgentInspector()" title="Wyjdź z trybu celownika (ESC)">
                            <i class="fa-solid fa-xmark"></i> Wyjdź
                        </button>
                    </div>
                </div>
            </div>

            
            <!-- ══════════ MODAL: CZAT DOWODZENIA Z AGENTEM AI (WIADOMOŚĆ BŁYSKAWICZNA) ══════════ -->
            <div class="modal-overlay" id="adminCommanderAiChatModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminCommanderAiChatModal')">
                <div class="modal-card" style="max-width: 680px; width:94%; background: #070d1e; border: 1.5px solid rgba(139, 92, 246, 0.55); box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 45px rgba(139, 92, 246, 0.35); border-radius: 24px; padding: 24px; position: relative; display:flex; flex-direction:column; max-height:90vh;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminCommanderAiChatModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <!-- Header -->
                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:46px; height:46px; border-radius:50%; background:linear-gradient(135deg, #8b5cf6, #3b82f6); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.35rem; box-shadow:0 4px 16px rgba(139,92,246,0.5);">
                                <i class="fa-solid fa-bolt"></i>
                            </div>
                            <div>
                                <h3 style="font-family:'Outfit', sans-serif; font-size:1.20rem; font-weight:800; color:#fff; margin:0; display:flex; align-items:center; gap:8px;">
                                    Czat Dowodzenia z Agentem AI 👑
                                </h3>
                                <div style="font-size:0.75rem; color:#a78bfa; font-weight:700;">
                                    Bezpośredni kanał rozkazów: Dowódca Nazir ➔ Agent Antigravity
                                </div>
                            </div>
                        </div>
                        <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:4px 10px; border-radius:20px; font-size:0.72rem; color:#34d399; font-weight:800;">
                            <span style="width:8px; height:8px; border-radius:50%; background:#10b981; display:inline-block; box-shadow:0 0 8px #10b981;"></span>
                            Agent AI: Nasłuchuje w tle 24/7
                        </div>
                    </div>

                    <!-- Quick Command Chips -->
                    <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:8px; margin-bottom:10px; -webkit-overflow-scrolling:touch;">
                        <button type="button" onclick="window.LuminaAdminSuite.sendQuickAiCommand('🚀 Publikuj dzisiejsze rozważanie misyjne we wszystkich kanałach')" style="white-space:nowrap; background:rgba(139,92,246,0.18); border:1px solid rgba(139,92,246,0.4); color:#c4b5fd; font-size:0.73rem; font-weight:700; padding:5px 10px; border-radius:12px; cursor:pointer;">
                            🚀 Publikuj Rozważanie
                        </button>
                        <button type="button" onclick="window.LuminaAdminSuite.sendQuickAiCommand('🔄 Zsynchronizuj całą bazę Firestore, wyczyść cache i odśwież widoki')" style="white-space:nowrap; background:rgba(56,189,248,0.18); border:1px solid rgba(56,189,248,0.4); color:#7dd3fc; font-size:0.73rem; font-weight:700; padding:5px 10px; border-radius:12px; cursor:pointer;">
                            🔄 Synchronizacja Bazy
                        </button>
                        <button type="button" onclick="window.LuminaAdminSuite.sendQuickAiCommand('📊 Sprawdź stan systemów, serwerów i transmisji Live')" style="white-space:nowrap; background:rgba(245,158,11,0.18); border:1px solid rgba(245,158,11,0.4); color:#fde047; font-size:0.73rem; font-weight:700; padding:5px 10px; border-radius:12px; cursor:pointer;">
                            📊 Status Systemów Live
                        </button>
                        <button type="button" onclick="window.LuminaAdminSuite.sendQuickAiCommand('🛡️ Wykonaj diagnostykę i automatyczną naprawę portalu LUMINA')" style="white-space:nowrap; background:rgba(16,185,129,0.18); border:1px solid rgba(16,185,129,0.4); color:#6ee7b7; font-size:0.73rem; font-weight:700; padding:5px 10px; border-radius:12px; cursor:pointer;">
                            🛡️ Diagnostyka i Naprawa
                        </button>
                    </div>

                    <!-- Live Message History Stream -->
                    <div id="commanderAiChatMessagesBox" style="flex:1; min-height:220px; max-height:340px; overflow-y:auto; background:rgba(11,18,36,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; margin-bottom:12px; display:flex; flex-direction:column; gap:10px;">
                        <div style="text-align:center; color:#64748b; font-size:0.75rem; padding:8px 0;">
                            ✨ Połączono z autonomicznym terminalem Agenta AI. Wszystkie rozkazy są zapisywane w chmurze i wykonywane w tle.
                        </div>
                    </div>

                    <!-- Input Form -->
                    <form onsubmit="window.LuminaAdminSuite.sendCommanderAiMessage(event)" style="display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; gap:8px;">
                            <textarea id="commanderAiInputText" rows="2" placeholder="Wpisz rozkaz lub zadanie dla Agenta (np. Zmień układ na stronie głównej, dodaj nową sekcję, sprawdź logi)..." style="flex:1; padding:10px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(139,92,246,0.35); color:#fff; font-family:inherit; font-size:13.5px; outline:none; resize:none;" required></textarea>
                            <button type="submit" style="padding:0 18px; border-radius:14px; background:linear-gradient(135deg, #8b5cf6, #2563eb); border:none; color:#fff; font-weight:800; font-size:0.90rem; cursor:pointer; box-shadow:0 4px 18px rgba(139,92,246,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; min-width:85px;">
                                <i class="fa-solid fa-paper-plane" style="font-size:1.1rem;"></i>
                                <span style="font-size:0.70rem;">Wyślij</span>
                            </button>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:#94a3b8;">
                            <span>💡 Komputer może pozostać włączony — Agent autonomicznie podejmie i wykona zlecenie.</span>
                            <span style="color:#a78bfa; font-weight:700;">Antigravity Engine 24/7</span>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ══════════ MODAL 5: TRYB CELOWNIKA - SAMODZIELNA EDYCJA & NOTA DLA AGENTA ══════════ -->
            <div class="modal-overlay" id="adminAgentNoteModal" onclick="if(event.target===this) window.LuminaAdminSuite.closeModal('adminAgentNoteModal')">
                <div class="modal-card" style="max-width: 620px; width:94%; background: #0b142e; border: 1.5px solid rgba(250, 204, 21, 0.6); box-shadow: 0 25px 70px rgba(0,0,0,0.95), 0 0 45px rgba(250, 204, 21, 0.3); border-radius: 24px; padding: 24px; position: relative; max-height:90vh; overflow-y:auto;">
                    <button class="modal-close-btn" onclick="window.LuminaAdminSuite.closeModal('adminAgentNoteModal')" aria-label="Zamknij" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>

                    <!-- Header -->
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                        <div style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #eab308); display:flex; align-items:center; justify-content:center; color:#0b142e; font-size:1.3rem; box-shadow:0 4px 14px rgba(245,158,11,0.5);">
                            <i class="fa-solid fa-crosshairs"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit', sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">
                                Studio Celownika Master Admin 🎯
                            </h3>
                            <div style="font-size:0.75rem; color:#fde047; font-weight:700;">
                                Samodzielna edycja na żywo lub zlecenie dla Agenta AI
                            </div>
                        </div>
                    </div>

                    <!-- Przechwycone dane techniczne elementu -->
                    <div style="background:rgba(15, 23, 42, 0.8); border:1px solid rgba(148, 163, 184, 0.2); border-radius:14px; padding:10px 14px; margin-bottom:14px; font-size:0.75rem; color:#94a3b8;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px; flex-wrap:wrap; gap:6px;">
                            <span>📍 Plik: <b id="notePageUrl" style="color:#38bdf8;">-</b></span>
                            <span>Tag: <b id="noteElementTag" style="color:#facc15;">-</b></span>
                            <span id="noteTargetProfileSlugWrap" style="display:none;">Profil: <b id="noteTargetProfileSlug" style="color:#ec4899;">-</b></span>
                        </div>
                        <div style="margin-bottom:2px; word-break:break-all;">
                            🎯 Selektor: <code id="noteElementSelector" style="color:#86efac; background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:4px; font-size:0.73rem;">-</code>
                        </div>
                        <div id="noteElementSnippetBox" style="color:#cbd5e1; font-style:italic; border-top:1px solid rgba(255,255,255,0.06); padding-top:4px; margin-top:4px; max-height:40px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:0.72rem;">
                            -
                        </div>
                    </div>

                    <!-- Zakładki: 1. Samodzielna Edycja Na Żywo | 2. Nota dla Agenta -->
                    <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:10px;">
                        <button type="button" id="tabBtnDirectEdit" onclick="window.LuminaAdminSuite.switchInspectorTab('direct_edit')" style="flex:1; padding:10px; border-radius:12px; font-weight:800; font-size:0.84rem; cursor:pointer; background:linear-gradient(135deg,#f59e0b,#d97706); color:#0b142e; border:none; display:flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 4px 12px rgba(245,158,11,0.3);">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> ⚡ Samodzielna Edycja
                        </button>
                        <button type="button" id="tabBtnAgentNote" onclick="window.LuminaAdminSuite.switchInspectorTab('agent_note')" style="flex:1; padding:10px; border-radius:12px; font-weight:800; font-size:0.84rem; cursor:pointer; background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; gap:6px;">
                            <i class="fa-solid fa-robot"></i> 🤖 Nota dla Agenta
                        </button>
                    </div>

                    <!-- ══════════ SEKCJA 1: SAMODZIELNA EDYCJA NA ŻYWO ══════════ -->
                    <div id="inspectorTabDirectEdit">
                        <!-- Edycja Zdjęcia / Grafiki (gdy zaznaczono obraz lub kartę profilu) -->
                        <div id="inspectorPhotoEditBox" style="background:rgba(255,255,255,0.04); border:1.5px solid rgba(245,158,11,0.4); border-radius:16px; padding:14px; margin-bottom:14px;">
                            <div style="font-size:0.84rem; font-weight:800; color:#fde047; margin-bottom:10px; display:flex; align-items:center; gap:7px;">
                                <i class="fa-solid fa-camera"></i> Zmień Zdjęcie / Awatar Profilu Na Żywo
                            </div>

                            <div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap; margin-bottom:12px;">
                                <div style="width:72px; height:72px; border-radius:16px; overflow:hidden; border:2px solid rgba(250,204,21,0.8); background:#000; flex-shrink:0; box-shadow:0 4px 14px rgba(0,0,0,0.5);">
                                    <img id="liveInspectorImgPreview" src="icon.png" alt="Podgląd" style="width:100%; height:100%; object-fit:cover;">
                                </div>
                                <div style="flex:1; min-width:180px;">
                                    <!-- Przycisk wgrywania z dysku -->
                                    <label style="display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-weight:800; font-size:0.82rem; padding:10px 16px; border-radius:12px; cursor:pointer; box-shadow:0 4px 14px rgba(16,185,129,0.4); transition:all 0.2s;">
                                        <i class="fa-solid fa-upload"></i> 📸 Wgraj Zdjęcie z Dysku
                                        <input type="file" id="liveInspectorFileInput" accept="image/*" style="display:none;" onchange="window.LuminaAdminSuite.handleInspectorFileUpload(event)">
                                    </label>
                                    <div style="font-size:0.72rem; color:#94a3b8; margin-top:6px;">
                                        Obsługuje JPG, PNG, WEBP. Zdjęcie zostanie natychmiast podmienione na stronie.
                                    </div>
                                </div>
                            </div>

                            <!-- Opcja 2: Podanie nazwy pliku lub URL -->
                            <div>
                                <label style="display:block; font-size:0.75rem; font-weight:700; color:#cbd5e1; margin-bottom:4px;">
                                    Lub wpisz nazwę pliku z serwera / link do zdjęcia:
                                </label>
                                <div style="display:flex; gap:8px;">
                                    <input type="text" id="liveInspectorImgUrlInput" placeholder="np. avatar_weronika.jpg lub https://..." style="flex:1; padding:8px 12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:13px; outline:none;">
                                    <button type="button" onclick="window.LuminaAdminSuite.applyInspectorImageFromUrl()" style="padding:0 14px; border-radius:10px; background:rgba(250,204,21,0.2); border:1px solid rgba(250,204,21,0.5); color:#fde047; font-weight:800; font-size:0.78rem; cursor:pointer;">
                                        Zastosuj
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Edycja Tekstu Elementu (nagłówek, imię, opis itp.) -->
                        <div id="inspectorTextEditBox" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.14); border-radius:16px; padding:14px; margin-bottom:14px;">
                            <div style="font-size:0.84rem; font-weight:800; color:#38bdf8; margin-bottom:8px; display:flex; align-items:center; gap:7px;">
                                <i class="fa-solid fa-pen-to-square"></i> Edytuj Tekst Elementu
                            </div>
                            <textarea id="liveInspectorTextInput" rows="2" placeholder="Wpisz nowy tekst elementu..." style="width:100%; padding:10px 12px; border-radius:10px; background:rgba(15,23,42,0.9); border:1px solid rgba(255,255,255,0.18); color:#fff; font-size:13px; outline:none; resize:vertical;"></textarea>
                            <div style="margin-top:6px; text-align:right;">
                                <button type="button" onclick="window.LuminaAdminSuite.applyInspectorTextChange()" style="padding:6px 14px; border-radius:8px; background:rgba(56,189,248,0.2); border:1px solid rgba(56,189,248,0.5); color:#7dd3fc; font-weight:800; font-size:0.76rem; cursor:pointer;">
                                    Zastosuj Tekst Na Żywo
                                </button>
                            </div>
                        </div>

                        <!-- Przyciski Zapisz / Zamknij -->
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; margin-top:10px;">
                            <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminAgentNoteModal')" style="padding:10px 18px; border-radius:20px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">
                                Zamknij
                            </button>
                            <button type="button" onclick="window.LuminaAdminSuite.saveInspectorLiveEditsPermanent()" style="padding:11px 22px; border-radius:20px; background:linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; font-weight:800; font-size:0.88rem; cursor:pointer; box-shadow:0 4px 16px rgba(16,185,129,0.45); display:inline-flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-floppy-disk"></i> 💾 Zapisz Zmiany Na Stałe
                            </button>
                        </div>
                    </div>

                    <!-- ══════════ SEKCJA 2: NOTA DLA AGENTA ══════════ -->
                    <div id="inspectorTabAgentNote" style="display:none;">
                        <form onsubmit="window.LuminaAdminSuite.saveAgentNoteSubmit(event)">
                            <div style="margin-bottom:12px;">
                                <label style="display:block; font-size:0.78rem; font-weight:800; color:#e2e8f0; margin-bottom:6px;">
                                    📝 Treść Uwag / Rozkaz dla Agenta:
                                </label>
                                <textarea id="agentNoteText" rows="4" placeholder="Np. Zmień układ kolumn, podmień ikonę, napraw zachowanie na telefonie..." style="width:100%; padding:12px 14px; border-radius:14px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:14px; outline:none; resize:vertical;"></textarea>
                            </div>

                            <div style="background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.10)); border:1.5px solid rgba(245,158,11,0.45); border-radius:16px; padding:12px 14px; margin-bottom:14px;">
                                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; margin-bottom:8px;">
                                    <input type="checkbox" id="agentNoteSpecialCheck" style="width:20px; height:20px; accent-color:#f59e0b; cursor:pointer; flex-shrink:0;">
                                    <span style="font-size:0.84rem; font-weight:800; color:#facc15; display:flex; align-items:center; gap:6px;">
                                        <i class="fa-solid fa-crown" style="color:#f59e0b;"></i> Rozkaz Dowódcy (Rygor Klasy Światowej)
                                    </span>
                                </label>
                                <textarea id="agentNoteSpecialGuidelines" rows="2" placeholder="Wpisz szczególne wytyczne..." style="width:100%; padding:10px 12px; border-radius:12px; background:rgba(15,23,42,0.85); border:1px solid rgba(245,158,11,0.3); color:#fef08a; font-family:inherit; font-size:13px; outline:none; resize:vertical;"></textarea>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
                                <button type="button" onclick="window.LuminaAdminSuite.closeModal('adminAgentNoteModal')" style="padding:10px 18px; border-radius:20px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; font-weight:700; cursor:pointer;">
                                    Anuluj
                                </button>
                                <button type="submit" style="padding:11px 22px; border-radius:20px; background:linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; font-weight:800; font-size:0.88rem; cursor:pointer; box-shadow:0 4px 16px rgba(16,185,129,0.45); display:inline-flex; align-items:center; gap:8px;">
                                    <i class="fa-solid fa-bolt"></i> ⚡ Wyślij Rozkaz dla Agenta
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        `;

        const nav = document.querySelector('nav.lumina-nav, nav, header');
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(container, nav.nextSibling);
        } else {
            document.body.prepend(container);
        }
    }

    // Główny obiekt API Master Admin Suite
    window.LuminaAdminSuite = {
        slug: detectCurrentProfileSlug(),

        init: function() {
            this.ensureMediaReplacerLoaded();
            this.slug = detectCurrentProfileSlug();
            injectAdminStyles();
            injectAdminDOM(this.slug);
            this.checkAndApplyAdminState();
            this.attachInlinePencils();
            this.loadProfileFromStorage(this.slug);
            this.checkIfCurrentProfileIsBlocked();
            window.addEventListener('resize', () => this.repositionHudBar());
        },

        ensureMediaReplacerLoaded: function() {
            if (!window.LuminaMediaReplacer && !document.querySelector('script[src*="lumina-admin-media-replacer"]')) {
                const s = document.createElement('script');
                s.src = 'js/lumina-admin-media-replacer.js?v=20260906_replacer_v2';
                s.onload = () => {
                    if (isUserMasterAdmin() && window.LuminaMediaReplacer) {
                        window.LuminaMediaReplacer.scanAndAttachButtons();
                    }
                };
                document.head.appendChild(s);
            }
        },

        repositionHudBar: function() {
            const hud = document.getElementById('luminaAdminHudBar');
            const inspBanner = document.getElementById('luminaAgentInspectorBanner');
            if (!hud) return;
            const topNav = document.querySelector('nav.lumina-nav, nav.portal-nav, nav.profile-navbar, .lumina-nav, nav');
            const navH = (topNav && topNav.offsetHeight > 0) ? topNav.offsetHeight : 56;
            hud.style.top = navH + 'px';

            const isHudActive = hud.classList.contains('active');
            const hudH = isHudActive ? hud.offsetHeight : 0;

            if (inspBanner) {
                inspBanner.style.top = (navH + hudH) + 'px';
            }

            let totalTop = navH + hudH;
            if (inspBanner && inspBanner.style.display !== 'none' && !inspBanner.classList.contains('minimized')) {
                totalTop += (inspBanner.offsetHeight || 36);
            }
            document.body.style.paddingTop = (totalTop + 4) + 'px';
        },

        checkAndApplyAdminState: function() {
            const isAdmin = isUserMasterAdmin();
            const hud = document.getElementById('luminaAdminHudBar');
            const shield = document.getElementById('luminaFloatingAdminShield');
            const shieldContainer = document.getElementById('luminaFloatingAdminShieldContainer');

            if (isAdmin) {
                document.body.classList.add('lumina-admin-mode', 'owner-mode-active', 'has-admin-hud');
                if (hud) {
                    hud.classList.add('active');
                    const isMin = sessionStorage.getItem('lumina_admin_hud_minimized') === 'true';
                    if (isMin) {
                        hud.classList.add('minimized');
                        document.body.classList.add('hud-minimized');
                        const icon = document.getElementById('hudMinimizeIcon');
                        if (icon) icon.className = 'fa-solid fa-plus';
                    } else {
                        hud.classList.remove('minimized');
                        document.body.classList.remove('hud-minimized');
                        const icon = document.getElementById('hudMinimizeIcon');
                        if (icon) icon.className = 'fa-solid fa-minus';
                    }
                }
                if (shield) shield.classList.add('unlocked');
                if (shieldContainer) shieldContainer.classList.add('unlocked');

                // Standard Zero-Egress: aktywuj przyciski "Wymień" (Dysk Google / YouTube)
                if (window.LuminaMediaReplacer && typeof window.LuminaMediaReplacer.scanAndAttachButtons === 'function') {
                    window.LuminaMediaReplacer.scanAndAttachButtons();
                }
            } else {
                document.body.classList.remove('lumina-admin-mode', 'owner-mode-active', 'has-admin-hud', 'hud-minimized');
                if (hud) hud.classList.remove('active', 'minimized');
                if (shield) shield.classList.remove('unlocked');
                if (shieldContainer) shieldContainer.classList.remove('unlocked');

                // Usuń przyciski wymiany po wylogowaniu
                document.querySelectorAll('.btn-lumina-replace-floating, .btn-lumina-replace-action').forEach(el => el.remove());
            }

            this.updateHudBlockBtnState();
            this.repositionHudBar();
        },

        toggleMinimizeHud: function() {
            const hud = document.getElementById('luminaAdminHudBar');
            const icon = document.getElementById('hudMinimizeIcon');
            if (!hud) return;
            const isMin = hud.classList.toggle('minimized');
            if (isMin) {
                document.body.classList.add('hud-minimized');
            } else {
                document.body.classList.remove('hud-minimized');
            }
            if (icon) {
                icon.className = isMin ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
            }
            try {
                sessionStorage.setItem('lumina_admin_hud_minimized', isMin ? 'true' : 'false');
            } catch(e) {}
            this.repositionHudBar();
            if (typeof window.showToast === 'function') {
                window.showToast(isMin ? 'Pasek opcji Administratora został zminimalizowany 🔽' : 'Pasek Administratora rozwinięty 🔼');
            }
        },

        openPinPrompt: async function() {
            const isAdmin = isUserMasterAdmin();
            if (isAdmin) {
                this.openAllProfilesManager();
                return;
            }

            const pin = prompt('🔐 Autoryzacja Administratora Portalu LUMINA (Wprowadź PIN):');
            if (!pin) return;

            const msgBuffer = new TextEncoder().encode(pin.trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hash === ADMIN_PIN_HASH) {
                sessionStorage.setItem('lumina_auth_master_admin', 'true');
                localStorage.setItem('lumina_auth_master_admin', 'true');
                this.checkAndApplyAdminState();
                if (window.LuminaMediaReplacer && typeof window.LuminaMediaReplacer.scanAndAttachButtons === 'function') {
                    window.LuminaMediaReplacer.scanAndAttachButtons();
                }
                if (typeof window.showToast === 'function') {
                    window.showToast('✨ Zalogowano do Panelu Głównego Administratora! Pełny dostęp aktywny.');
                } else {
                    alert('✨ Zalogowano do Panelu Głównego Administratora! Pełna kontrola aktywna.');
                }
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('❌ Nieprawidłowy kod PIN Administratora!');
                } else {
                    alert('❌ Nieprawidłowy kod PIN!');
                }
            }
        },

        lockAdminMode: function() {
            sessionStorage.removeItem('lumina_auth_master_admin');
            localStorage.removeItem('lumina_auth_master_admin');
            sessionStorage.removeItem('lumina_auth_owner_cezaryrgowski');
            localStorage.removeItem('lumina_auth_owner_cezaryrgowski');
            this.checkAndApplyAdminState();
            if (typeof window.showToast === 'function') {
                window.showToast('🔒 Wylogowano z trybu Administratora. Pasek został schowany.');
            } else {
                alert('🔒 Wylogowano z trybu Administratora.');
            }
        },

        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('open');
                modal.style.display = 'none';
            }
        },

        
        // ══════════ ⚡ COMMANDER AI INSTANT CHAT (DOWÓDCA ↔ AGENT ANTIGRAVITY) ══════════
        commanderAiUnsub: null,

        openCommanderAiChatModal: function() {
            this.openModal('adminCommanderAiChatModal');
            this.subscribeToCommanderAiChat();
            setTimeout(() => {
                const input = document.getElementById('commanderAiInputText');
                if (input) input.focus();
            }, 150);
        },

        subscribeToCommanderAiChat: function() {
            if (this.commanderAiUnsub) {
                try { this.commanderAiUnsub(); } catch(e) {}
                this.commanderAiUnsub = null;
            }

            const box = document.getElementById('commanderAiChatMessagesBox');
            if (!box) return;

            const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_commander_ai_chat';
            
            const fetchAndRender = async () => {
                try {
                    const res = await fetch(FIRESTORE_URL);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (!data || !data.documents) {
                        box.innerHTML = '<div style="text-align:center; color:#64748b; font-size:0.75rem; padding:18px 0;">🕊️ Brak wcześniejszych wiadomości. Wpisz swój pierwszy rozkaz błyskawiczny dla Agenta AI!</div>';
                        return;
                    }

                    const msgs = data.documents.map(d => {
                        const f = d.fields || {};
                        return {
                            id: d.name ? d.name.split('/').pop() : 'msg',
                            text: f.text?.stringValue || '',
                            sender: f.sender?.stringValue || 'Dowódca',
                            status: f.status?.stringValue || 'pending',
                            reply: f.reply?.stringValue || '',
                            createdAt: f.createdAt?.integerValue ? parseInt(f.createdAt.integerValue, 10) : Date.now(),
                            replyAt: f.replyAt?.timestampValue || ''
                        };
                    });

                    msgs.sort((a, b) => a.createdAt - b.createdAt);

                    let html = '';
                    msgs.forEach(m => {
                        html += `
                            <!-- Wiadomość Dowódcy -->
                            <div style="align-self:flex-end; max-width:85%; background:linear-gradient(135deg, rgba(139,92,246,0.30), rgba(59,130,246,0.30)); border:1px solid rgba(139,92,246,0.55); border-radius:14px 14px 2px 14px; padding:10px 14px; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.35);">
                                <div style="font-size:0.68rem; color:#c4b5fd; font-weight:800; margin-bottom:3px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
                                    <span>👑 Dowódca Nazir</span>
                                    <span style="font-size:0.65rem; color:#94a3b8;">${new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                </div>
                                <div style="font-size:0.86rem; line-height:1.4;">${m.text}</div>
                                <div style="margin-top:4px; font-size:0.65rem; display:flex; align-items:center; gap:4px; color:${m.status === 'completed' ? '#34d399' : '#f59e0b'};">
                                    <i class="fa-solid ${m.status === 'completed' ? 'fa-check-double' : 'fa-clock'}"></i>
                                    ${m.status === 'completed' ? 'Zrealizowano' : 'Oczekuje na wykonanie w tle'}
                                </div>
                            </div>
                        `;

                        if (m.reply) {
                            html += `
                                <!-- Odpowiedź Agenta AI -->
                                <div style="align-self:flex-start; max-width:85%; background:rgba(15,23,42,0.92); border:1px solid rgba(56,189,248,0.4); border-radius:14px 14px 14px 2px; padding:10px 14px; color:#e2e8f0; box-shadow:0 4px 14px rgba(0,0,0,0.4);">
                                    <div style="font-size:0.68rem; color:#38bdf8; font-weight:800; margin-bottom:3px; display:flex; align-items:center; gap:6px;">
                                        <i class="fa-solid fa-robot"></i> Agent AI Antigravity
                                    </div>
                                    <div style="font-size:0.84rem; line-height:1.4; color:#f1f5f9;">${m.reply}</div>
                                </div>
                            `;
                        }
                    });

                    box.innerHTML = html;
                    box.scrollTop = box.scrollHeight;
                } catch(e) {
                    console.warn('Lumina AI chat fetch notice:', e.message);
                }
            };

            fetchAndRender();
            const interval = setInterval(fetchAndRender, 3500);
            this.commanderAiUnsub = () => clearInterval(interval);
        },

        sendCommanderAiMessage: async function(e) {
            if (e) e.preventDefault();
            const input = document.getElementById('commanderAiInputText');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            const msgId = 'cmd_' + Date.now();
            const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_commander_ai_chat/' + msgId;

            const body = {
                fields: {
                    id: { stringValue: msgId },
                    text: { stringValue: text },
                    sender: { stringValue: 'Dowódca (Cezary Rogowski)' },
                    status: { stringValue: 'pending' },
                    reply: { stringValue: '' },
                    createdAt: { integerValue: String(Date.now()) },
                    timestamp: { timestampValue: new Date().toISOString() }
                }
            };

            input.value = '';

            try {
                await fetch(FIRESTORE_URL, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (typeof window.showToast === 'function') {
                    window.showToast('⚡ Rozkaz Błyskawiczny przesłany do Agenta AI! Zadanie w toku. 🚀');
                }
                this.subscribeToCommanderAiChat();
            } catch(err) {
                console.warn('Błąd wysyłania rozkazu:', err);
            }
        },

        sendQuickAiCommand: function(text) {
            const input = document.getElementById('commanderAiInputText');
            if (input) {
                input.value = text;
                this.sendCommanderAiMessage();
            }
        },

        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('open');
                modal.style.display = 'flex';
            }
        },

        // ══════════ 🎯 AGENT INSPECTOR & NOTA DLA AGENTA (@N) ══════════
        isInspectorActive: false,
        inspectedTargetEl: null,
        _boundMouseMove: null,
        _boundClick: null,
        _boundKeyDown: null,

        toggleAgentInspector: function() {
            if (this.isInspectorActive) {
                this.deactivateAgentInspector();
            } else {
                this.activateAgentInspector();
            }
        },

        activateAgentInspector: function() {
            if (!isUserMasterAdmin()) {
                this.openPinPrompt();
                return;
            }

            this.isInspectorActive = true;
            document.body.classList.add('lumina-agent-inspector-active');
            const banner = document.getElementById('luminaAgentInspectorBanner');
            if (banner) banner.style.display = 'block';

            // Podpięcie nasłuchiwaczy zdarzeń
            this._boundMouseMove = (e) => this.handleInspectorMouseMove(e);
            this._boundClick = (e) => this.handleInspectorClick(e);
            this._boundKeyDown = (e) => {
                if (e.key === 'Escape') this.deactivateAgentInspector();
            };

            document.addEventListener('mousemove', this._boundMouseMove, true);
            document.addEventListener('click', this._boundClick, true);
            document.addEventListener('keydown', this._boundKeyDown, true);

            this.repositionHudBar();

            if (typeof window.showToast === 'function') {
                window.showToast('🎯 Tryb celownika aktywny! Najedź myszką i kliknij na dowolny element.');
            }
        },

        toggleMinimizeInspectorBanner: function() {
            const b = document.getElementById('luminaAgentInspectorBanner');
            const icon = document.getElementById('inspectorMinimizeIcon');
            if (!b) return;
            const isMin = b.classList.toggle('minimized');
            if (icon) icon.className = isMin ? 'fa-solid fa-plus' : 'fa-solid fa-minus';
            this.repositionHudBar();
        },

        deactivateAgentInspector: function() {
            this.isInspectorActive = false;
            document.body.classList.remove('lumina-agent-inspector-active');
            const banner = document.getElementById('luminaAgentInspectorBanner');
            if (banner) banner.style.display = 'none';

            document.querySelectorAll('.lumina-agent-hover-target').forEach(el => el.classList.remove('lumina-agent-hover-target'));

            if (this._boundMouseMove) document.removeEventListener('mousemove', this._boundMouseMove, true);
            if (this._boundClick) document.removeEventListener('click', this._boundClick, true);
            if (this._boundKeyDown) document.removeEventListener('keydown', this._boundKeyDown, true);

            this.repositionHudBar();
        },

        handleInspectorMouseMove: function(e) {
            if (!this.isInspectorActive) return;
            const target = e.target;
            if (!target) return;

            // Ignorujemy elementy panelu administracyjnego i modali
            if (target.closest('#luminaAdminSuiteContainer') || 
                target.closest('#luminaAgentInspectorBanner') || 
                target.closest('.modal-overlay') || 
                target.tagName === 'HTML' || 
                target.tagName === 'BODY') {
                return;
            }

            document.querySelectorAll('.lumina-agent-hover-target').forEach(el => {
                if (el !== target) el.classList.remove('lumina-agent-hover-target');
            });
            target.classList.add('lumina-agent-hover-target');
        },

        handleInspectorClick: function(e) {
            if (!this.isInspectorActive) return;
            const target = e.target;
            if (!target) return;

            // Ignorujemy kliknięcie w banner lub wewnątrz modala
            if (target.closest('#luminaAgentInspectorBanner') || target.closest('#adminAgentNoteModal')) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            document.querySelectorAll('.lumina-agent-hover-target').forEach(el => el.classList.remove('lumina-agent-hover-target'));
            this.openAgentNoteModalForElement(target);
        },

        buildElementSelector: function(el) {
            if (!el || el === document.body) return 'body';
            if (el.id) return '#' + el.id;

            const path = [];
            let curr = el;
            while (curr && curr !== document.body && curr !== document.documentElement && path.length < 4) {
                let part = curr.tagName.toLowerCase();
                if (curr.id) {
                    part += '#' + curr.id;
                    path.unshift(part);
                    break;
                } else if (curr.className && typeof curr.className === 'string') {
                    const classes = curr.className.split(/\s+/).filter(c => c && !c.startsWith('lumina-agent-') && !c.startsWith('owner-') && c !== 'active');
                    if (classes.length > 0) {
                        part += '.' + classes.slice(0, 2).join('.');
                    }
                }
                path.unshift(part);
                curr = curr.parentElement;
            }
            return path.join(' > ');
        },

        
        // ── TRYB CELOWNIKA: SAMODZIELNA EDYCJA NA ŻYWO I UPLOAD ZDJĘĆ ──
        switchInspectorTab: function(tabName) {
            const editTab = document.getElementById('inspectorTabDirectEdit');
            const noteTab = document.getElementById('inspectorTabAgentNote');
            const btnEdit = document.getElementById('tabBtnDirectEdit');
            const btnNote = document.getElementById('tabBtnAgentNote');

            if (tabName === 'direct_edit') {
                if (editTab) editTab.style.display = 'block';
                if (noteTab) noteTab.style.display = 'none';
                if (btnEdit) {
                    btnEdit.style.background = 'linear-gradient(135deg,#f59e0b,#d97706)';
                    btnEdit.style.color = '#0b142e';
                    btnEdit.style.border = 'none';
                }
                if (btnNote) {
                    btnNote.style.background = 'rgba(255,255,255,0.06)';
                    btnNote.style.color = '#cbd5e1';
                    btnNote.style.border = '1px solid rgba(255,255,255,0.15)';
                }
            } else {
                if (editTab) editTab.style.display = 'none';
                if (noteTab) noteTab.style.display = 'block';
                if (btnNote) {
                    btnNote.style.background = 'linear-gradient(135deg,#10b981,#059669)';
                    btnNote.style.color = '#fff';
                    btnNote.style.border = 'none';
                }
                if (btnEdit) {
                    btnEdit.style.background = 'rgba(255,255,255,0.06)';
                    btnEdit.style.color = '#cbd5e1';
                    btnEdit.style.border = '1px solid rgba(255,255,255,0.15)';
                }
            }
        },

        handleInspectorFileUpload: function(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                this.applyLiveInspectorImage(dataUrl);
            };
            reader.readAsDataURL(file);
        },

        applyInspectorImageFromUrl: function() {
            const url = document.getElementById('liveInspectorImgUrlInput')?.value?.trim();
            if (!url) {
                alert('Proszę podać nazwę pliku lub URL zdjęcia.');
                return;
            }
            this.applyLiveInspectorImage(url);
        },

        applyLiveInspectorImage: function(imgSrc) {
            const preview = document.getElementById('liveInspectorImgPreview');
            if (preview) preview.src = imgSrc;

            const el = this.inspectedTargetEl;
            if (!el) return;

            let targetImg = null;
            if (el.tagName === 'IMG') {
                targetImg = el;
            } else {
                targetImg = el.querySelector('img') || el.closest('.profile-card')?.querySelector('img') || el.closest('.card-photo')?.querySelector('img');
            }

            if (targetImg) {
                targetImg.src = imgSrc;
                targetImg.setAttribute('src', imgSrc);
                targetImg.removeAttribute('srcset');
            }

            // Jeśli to karta profilu, ustal slug
            const card = el.closest('.profile-card');
            const slug = card?.getAttribute('data-profile-slug') || (el.getAttribute && el.getAttribute('data-profile-slug')) || '';

            this._currentInspectorImgUpdate = {
                slug: slug,
                imgSrc: imgSrc,
                elementSelector: this.buildElementSelector(targetImg || el)
            };

            if (typeof window.showToast === 'function') {
                window.showToast('📸 Zdjęcie podmienione na żywo! Kliknij [Zapisz Zmiany Na Stałe], aby utrwalić.');
            }
        },

        applyInspectorTextChange: function() {
            const text = document.getElementById('liveInspectorTextInput')?.value;
            const el = this.inspectedTargetEl;
            if (!el || text === undefined) return;

            el.innerText = text;
            this._currentInspectorTextUpdate = {
                text: text,
                elementSelector: this.buildElementSelector(el)
            };

            if (typeof window.showToast === 'function') {
                window.showToast('✏️ Tekst zaktualizowany na żywo! Kliknij [Zapisz Zmiany Na Stałe], aby utrwalić.');
            }
        },

        saveInspectorLiveEditsPermanent: async function() {
            try {
                // 1. Zapis zdjęcia profilu jeśli dotyczyło profilu
                if (this._currentInspectorImgUpdate) {
                    const { slug, imgSrc } = this._currentInspectorImgUpdate;
                    if (slug) {
                        localStorage.setItem('lumina_avatar_' + slug, imgSrc);
                        localStorage.setItem('lumina_custom_avatar_' + slug, imgSrc);
                        if (window.LUMINA_COMMUNITY_PROFILES && window.LUMINA_COMMUNITY_PROFILES[slug]) {
                            window.LUMINA_COMMUNITY_PROFILES[slug].avatar = imgSrc;
                        }
                        if (window.LuminaDB?.saveProfileUpdate) {
                            await window.LuminaDB.saveProfileUpdate(slug, { avatar: imgSrc });
                        }
                    }
                }

                // 2. Zapis zmian w ogólnym rejestrze modyfikacji
                const overrides = JSON.parse(localStorage.getItem('lumina_element_overrides') || '{}');
                if (this._currentInspectorImgUpdate) {
                    overrides[this._currentInspectorImgUpdate.elementSelector] = { type: 'img', src: this._currentInspectorImgUpdate.imgSrc };
                }
                if (this._currentInspectorTextUpdate) {
                    overrides[this._currentInspectorTextUpdate.elementSelector] = { type: 'text', text: this._currentInspectorTextUpdate.text };
                }
                localStorage.setItem('lumina_element_overrides', JSON.stringify(overrides));

                // Natychmiastowe utrwalenie w DOM
                if (typeof window.applyAllLuminaCustomAvatars === 'function') {
                    window.applyAllLuminaCustomAvatars();
                }

                this.closeModal('adminAgentNoteModal');
                this.deactivateAgentInspector();

                if (typeof window.showToast === 'function') {
                    window.showToast('💾✨ Nowe zdjęcie zostało trwale zapisane i nie zniknie po odświeżeniu!');
                } else {
                    alert('Wszystkie zmiany zostały trwale zapisane!');
                }
            } catch(e) {
                console.error('Error saving inspector live edits:', e);
                alert('Zapisano lokalnie.');
            }
        },

        openAgentNoteModalForElement: function(el) {
            this.inspectedTargetEl = el;
            const pageName = window.location.pathname.split('/').pop() || 'lumina.html';
            const selector = this.buildElementSelector(el);
            const tag = el.tagName ? el.tagName.toLowerCase() : 'div';
            const snippet = (el.innerText || el.textContent || el.alt || el.src || '').trim().replace(/\s+/g, ' ').substring(0, 140);

            const pageUrlEl = document.getElementById('notePageUrl');
            const tagEl = document.getElementById('noteElementTag');
            const selEl = document.getElementById('noteElementSelector');
            const snipEl = document.getElementById('noteElementSnippetBox');
            const textEl = document.getElementById('agentNoteText');

            if (pageUrlEl) pageUrlEl.textContent = pageName + (window.location.search || '');
            if (tagEl) tagEl.textContent = `<${tag}>`;
            if (selEl) selEl.textContent = selector;
            if (snipEl) snipEl.textContent = snippet ? `„${snippet}”` : '(brak bezpośredniego tekstu / kontener)';
            if (textEl) {
                textEl.value = '';
                setTimeout(() => textEl.focus(), 150);
            }

            const specialCheck = document.getElementById('agentNoteSpecialCheck');
            if (specialCheck) specialCheck.checked = false;
            const specialGuid = document.getElementById('agentNoteSpecialGuidelines');
            if (specialGuid) specialGuid.value = '';
            const prioSelect = document.getElementById('agentNotePriority');
            if (prioSelect) prioSelect.value = 'normal';

            this.openModal('adminAgentNoteModal');
        },

        saveAgentNoteSubmit: async function(e, mode = 'execute_now') {
            if (e) e.preventDefault();
            const text = document.getElementById('agentNoteText')?.value?.trim();
            if (!text) {
                alert('Proszę wpisać treść notatki / rozkazu dla Agenta.');
                return;
            }

            const category = document.getElementById('agentNoteCategory')?.value || 'Wygląd / CSS';
            const priorityInput = document.getElementById('agentNotePriority')?.value || 'normal';
            const specialChecked = !!document.getElementById('agentNoteSpecialCheck')?.checked;
            const specialGuidelines = document.getElementById('agentNoteSpecialGuidelines')?.value?.trim() || '';
            const isImmediate = (mode === 'execute_now');
            const finalPriority = (specialChecked || isImmediate || specialGuidelines) ? 'critical' : priorityInput;
            const pageName = document.getElementById('notePageUrl')?.textContent || (window.location.pathname.split('/').pop() || 'lumina.html');
            const selector = document.getElementById('noteElementSelector')?.textContent || '';
            const tag = document.getElementById('noteElementTag')?.textContent || '';
            const snippet = document.getElementById('noteElementSnippetBox')?.textContent || '';

            let fullFormattedNote = text;
            if (specialChecked || specialGuidelines) {
                fullFormattedNote = `👑 [UWAGI SPECJALNE DOWÓDCY - RYGOR KLASY ŚWIATOWEJ]:\n${specialGuidelines ? '• WYTYCZNE: ' + specialGuidelines + '\n\n' : ''}• TREŚĆ ZADANIA:\n${text}`;
            }

            const noteId = 'note_' + Date.now();
            const noteObj = {
                id: noteId,
                page: pageName,
                fullUrl: window.location.href,
                selector: selector,
                tag: tag,
                snippet: snippet,
                note: fullFormattedNote,
                rawNote: text,
                specialGuidelines: specialGuidelines,
                isSpecialPriority: (specialChecked || !!specialGuidelines),
                masterclassRigor: true,
                category: category,
                priority: finalPriority,
                autoExecute: isImmediate,
                commandType: isImmediate ? 'IMMEDIATE_ORDER' : 'DIARY_NOTE',
                status: 'pending',
                author: 'Dowódca (Master Admin)',
                createdAt: new Date().toISOString(),
                timestamp: Date.now()
            };

            // Zapis do Firestore / localStorage
            // 1. Zawsze bezpośredni zapis do Firestore REST (gwarancja dotarcia do Agenta 24/7)
            try {
                const restUrl = 'https://firestore.googleapis.com/v1/projects/lumina-cc/databases/(default)/documents/lumina_agent_notes/' + noteId;
                await fetch(restUrl, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fields: {
                            id: { stringValue: noteId },
                            page: { stringValue: pageName },
                            fullUrl: { stringValue: window.location.href },
                            selector: { stringValue: selector },
                            tag: { stringValue: tag },
                            snippet: { stringValue: snippet },
                            note: { stringValue: fullFormattedNote },
                            rawNote: { stringValue: text },
                            specialGuidelines: { stringValue: specialGuidelines },
                            category: { stringValue: category },
                            priority: { stringValue: finalPriority },
                            autoExecute: { booleanValue: isImmediate },
                            commandType: { stringValue: isImmediate ? 'IMMEDIATE_ORDER' : 'DIARY_NOTE' },
                            status: { stringValue: 'pending' },
                            author: { stringValue: 'Dowódca (Master Admin)' },
                            createdAt: { stringValue: new Date().toISOString() },
                            timestamp: { integerValue: String(Date.now()) }
                        }
                    })
                });
            } catch(restErr) {
                console.warn('LuminaAdminSuite: REST direct write failed:', restErr);
            }

            if (window.LuminaDB?.saveAgentNoteToCloud) {
                await window.LuminaDB.saveAgentNoteToCloud(noteObj);
            } else {
                try {
                    const local = JSON.parse(localStorage.getItem('lumina_agent_notes') || '[]');
                    local.unshift(noteObj);
                    localStorage.setItem('lumina_agent_notes', JSON.stringify(local));
                } catch(err) {}
            }

            this.closeModal('adminAgentNoteModal');
            this.deactivateAgentInspector();

            if (isImmediate) {
                if (typeof window.showToast === 'function') {
                    window.showToast('⚡ ROZKAZ DLA AGENTA WYSŁANY! Agent w tle natychmiast przystępuje do realizacji zadania. 🚀');
                } else {
                    alert('⚡ ROZKAZ DLA AGENTA WYSŁANY! Agent w tle natychmiast przystępuje do realizacji.');
                }
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('💾 Nota zapisana w Dzienniku! Wpisz @N w czacie, gdy zechcesz, aby Agent ją wykonał.');
                } else {
                    alert('💾 Nota zapisana w Dzienniku (@N).');
                }
            }
        },
        openFullEditor: function(targetSlug = null) {
            const s = targetSlug || this.slug;
            document.getElementById('adminTargetSlugHidden').value = s;
            document.getElementById('adminModalProfileTitle').textContent = `Edycja Profilu: ${s} • Master Admin`;

            const data = this.getCurrentData(s);
            document.getElementById('adminInputName').value = data.name || '';
            document.getElementById('adminInputAge').value = data.age || '';
            document.getElementById('adminInputCity').value = data.city || '';
            document.getElementById('adminInputBirth').value = data.birth || '';
            document.getElementById('adminInputJob').value = data.job || '';
            document.getElementById('adminInputChurch').value = data.church || '';
            document.getElementById('adminInputVerified').value = data.verified ? 'true' : 'false';
            document.getElementById('adminInputPrivacy').value = data.privacy || 'public';
            document.getElementById('adminInputVerse').value = data.verse || '';
            document.getElementById('adminInputVerseRef').value = data.verseRef || '';
            const curVid = data.avatarVideo || localStorage.getItem('lumina_avatar_video_' + s) || '';
            if (document.getElementById('adminInputVideoAvatar')) {
                document.getElementById('adminInputVideoAvatar').value = curVid;
            }
            document.getElementById('adminInputBio').value = data.bio || '';
            document.getElementById('adminInputTags').value = (data.tags || []).join(', ');

            this.openModal('adminUniversalProfileModal');
        },

        getCurrentData: function(slug = null) {
            const s = slug || this.slug;
            const saved = localStorage.getItem('lumina_profile_' + s);
            if (saved) {
                try { return JSON.parse(saved); } catch(e) {}
            }

            // Fallback z DOM jeśli to bieżący profil
            if (s === this.slug) {
                const nameEl = document.querySelector('.head-user-name span, .profile-name, h1');
                const verseEl = document.querySelector('.verse-box, .profile-verse');
                const bioEl = document.querySelector('.sidebar-card p, .side-card p, .profile-bio');

                return {
                    name: nameEl ? nameEl.textContent.trim() : s,
                    age: '',
                    city: '',
                    birth: '',
                    job: '',
                    church: '',
                    verified: true,
                    privacy: 'public',
                    verse: verseEl ? verseEl.textContent.trim() : '',
                    verseRef: '',
                    bio: bioEl ? bioEl.textContent.trim() : '',
                    tags: []
                };
            }

            return {
                name: s,
                age: '',
                city: '',
                birth: '',
                job: '',
                church: '',
                verified: false,
                privacy: 'public',
                verse: '',
                verseRef: '',
                bio: '',
                tags: []
            };
        },

        saveProfileSubmit: function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const targetSlug = document.getElementById('adminTargetSlugHidden').value || this.slug;
            const existing = this.getCurrentData(targetSlug) || {};
            const edits = {
                name: document.getElementById('adminInputName').value.trim(),
                age: document.getElementById('adminInputAge').value.trim(),
                city: document.getElementById('adminInputCity').value.trim(),
                birth: document.getElementById('adminInputBirth').value.trim(),
                job: document.getElementById('adminInputJob').value.trim(),
                church: document.getElementById('adminInputChurch').value.trim(),
                verified: document.getElementById('adminInputVerified').value === 'true',
                privacy: document.getElementById('adminInputPrivacy').value,
                verse: document.getElementById('adminInputVerse').value.trim(),
                verseRef: document.getElementById('adminInputVerseRef').value.trim(),
                avatarVideo: document.getElementById('adminInputVideoAvatar') ? document.getElementById('adminInputVideoAvatar').value.trim() : '',
                bio: document.getElementById('adminInputBio').value.trim(),
                tags: document.getElementById('adminInputTags').value.split(',').map(t => t.trim()).filter(Boolean)
            };
            const merged = { ...existing, ...edits, slug: targetSlug };

            try {
                localStorage.setItem('lumina_profile_' + targetSlug, JSON.stringify(merged));
                if (existing.uid) localStorage.setItem('lumina_profile_' + existing.uid, JSON.stringify(merged));
            } catch(e) {}

            if (window._cloudProfileData && (window._cloudProfileData.slug === targetSlug || window._cloudProfileData.uid === targetSlug)) {
                window._cloudProfileData = merged;
            }

            if (window.LuminaDB && typeof window.LuminaDB.saveProfileToCloud === 'function') {
                window.LuminaDB.saveProfileToCloud(targetSlug, merged);
            }

            if (edits.avatarVideo) {
                localStorage.setItem('lumina_avatar_video_' + targetSlug, edits.avatarVideo);
                if (window.LuminaPremiumAvatar) {
                    window.LuminaPremiumAvatar.mountVideoAvatars(targetSlug);
                }
            } else {
                localStorage.removeItem('lumina_avatar_video_' + targetSlug);
                if (window.LuminaPremiumAvatar) {
                    window.LuminaPremiumAvatar.mountVideoAvatars(targetSlug);
                }
            }
            
            if (targetSlug === this.slug) {
                this.applyDataToDOM(merged);
            }

            this.closeModal('adminUniversalProfileModal');
            this.renderProfilesListInModal();

            if (typeof window.showToast === 'function') {
                window.showToast(`✨ Zmiany w profilu ${merged.name} zostały pomyślnie zapisane!`);
            } else {
                alert(`✨ Zmiany w profilu ${merged.name} zostały pomyślnie zapisane!`);
            }
        },

        applyDataToDOM: function(data) {
            if (!data) return;

            // Apply Name
            const nameEls = document.querySelectorAll('.head-user-name span, .profile-name, #userNameEl, #mName');
            nameEls.forEach(el => { if (data.name) el.textContent = data.name; });

            // Apply Age / City
            const ageEls = document.querySelectorAll('.age-tag, #userAgeCityEl');
            ageEls.forEach(el => { if (data.age || data.city) el.textContent = [data.age, data.city].filter(Boolean).join(' • '); });

            // Helper escapeHtml
            const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');

            // Apply Verse
            const verseEls = document.querySelectorAll('.verse-box, .profile-verse');
            verseEls.forEach(el => {
                if (data.verse) {
                    el.innerHTML = `„${esc(data.verse)}” <span class="verse-ref" style="display:block; margin-top:6px; color:#facc15; font-weight:700;">${esc(data.verseRef || '')}</span>`;
                }
            });

            // Apply Bio
            const bioEls = document.querySelectorAll('.sidebar-card p, .side-card p, .profile-bio, #userBioEl');
            bioEls.forEach(el => { if (data.bio) el.textContent = data.bio; });

            // Apply Tags
            if (data.tags && data.tags.length > 0) {
                const tagsContainer = document.querySelector('.profile-tags-row, .tags-container, .profile-tags');
                if (tagsContainer) {
                    tagsContainer.innerHTML = data.tags.map(t => `<span class="tag-pill gold">${esc(t)}</span>`).join(' ');
                }
            }
        },

        loadProfileFromStorage: function(slug) {
            const saved = localStorage.getItem('lumina_profile_' + slug);
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    this.applyDataToDOM(data);
                } catch(e) {}
            }
        },

        attachInlinePencils: function() {
            const nameEl = document.querySelector('.head-user-name, .profile-name');
            if (nameEl && !nameEl.querySelector('.admin-inline-edit-btn') && !nameEl.querySelector('.card-edit-btn')) {
                const btn = document.createElement('button');
                btn.className = 'admin-inline-edit-btn';
                btn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                btn.title = 'Edytuj Imię i Dane Profilu';
                btn.onclick = () => this.openFullEditor();
                nameEl.appendChild(btn);
            }

            const verseEl = document.querySelector('.verse-box, .profile-verse');
            if (verseEl && !verseEl.querySelector('.admin-inline-edit-btn')) {
                const card = verseEl.closest('.sidebar-card');
                if (!card || !card.querySelector('.card-edit-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'admin-inline-edit-btn';
                    btn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                    btn.title = 'Edytuj Werset Biblijny';
                    btn.onclick = () => this.openFullEditor();
                    verseEl.appendChild(btn);
                }
            }
        },

        // ══════════ BLOKOWANIE / ODBLOKOWYWANIE KONT (BANNING) ══════════
        isProfileBlocked: function(slug) {
            const blocked = getBlockedProfiles();
            return blocked.includes((slug || this.slug).toLowerCase().trim());
        },

        toggleBlockProfile: function(slug) {
            const target = (slug || this.slug).toLowerCase().trim();
            let blocked = getBlockedProfiles();
            const isCurrentlyBlocked = blocked.includes(target);

            if (isCurrentlyBlocked) {
                blocked = blocked.filter(s => s !== target);
                saveBlockedProfiles(blocked);
                if (typeof window.showToast === 'function') {
                    window.showToast(`✅ Profil ${target} został ODBLOKOWANY.`);
                }
            } else {
                blocked.push(target);
                saveBlockedProfiles(blocked);
                if (typeof window.showToast === 'function') {
                    window.showToast(`🚫 Profil ${target} został ZABLOKOWANY.`);
                }
            }

            this.updateHudBlockBtnState();
            this.checkIfCurrentProfileIsBlocked();
            this.renderProfilesListInModal();
        },

        toggleBlockCurrentProfile: function() {
            this.toggleBlockProfile(this.slug);
        },

        updateHudBlockBtnState: function() {
            const btn = document.getElementById('hudBtnToggleBlock');
            if (!btn) return;
            const isBlocked = this.isProfileBlocked(this.slug);
            if (isBlocked) {
                btn.className = 'admin-suite-btn btn-cyan';
                btn.innerHTML = '<i class="fa-solid fa-unlock"></i> Odblokuj Profil';
            } else {
                btn.className = 'admin-suite-btn btn-warn';
                btn.innerHTML = '<i class="fa-solid fa-ban"></i> Zablokuj Profil';
            }
        },

        checkIfCurrentProfileIsBlocked: function() {
            const isBlocked = this.isProfileBlocked(this.slug);
            let banner = document.getElementById('luminaBlockedBanner');
            const mainContainer = document.querySelector('.main-feed-col, .profile-container, main');

            if (isBlocked) {
                if (!banner && mainContainer) {
                    banner = document.createElement('div');
                    banner.id = 'luminaBlockedBanner';
                    banner.className = 'lumina-user-blocked-banner';
                    banner.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:1.4rem;"></i> <div><b>Konto Zablokowane przez Administratora:</b> Publikacje i interakcje dla tego profilu zostały zawieszone.</div>';
                    mainContainer.prepend(banner);
                }
            } else {
                if (banner) banner.remove();
            }
        },

        // ══════════ USUWANIE I TWORZENIE PROFILI ══════════
        deleteProfile: function(slug) {
            const target = (slug || this.slug).toLowerCase().trim();
            if (!confirm(`⚠️ CZY NA PEWNO chcesz bezpowrotnie USUNĄĆ profil "${target}" oraz wszystkie jego powiązane dane z bazy portalu?`)) {
                return;
            }

            // Usunięcie danych profilu z localStorage
            localStorage.removeItem('lumina_profile_' + target);
            localStorage.removeItem('lumina_avatar_' + target);
            localStorage.removeItem('lumina_cover_' + target);

            // Usunięcie z listy zarejestrowanych
            try {
                let customUsers = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
                customUsers = customUsers.filter(u => u.slug !== target);
                localStorage.setItem('lumina_custom_users_list', JSON.stringify(customUsers));
            } catch(e) {}

            if (typeof window.showToast === 'function') {
                window.showToast(`🗑️ Profil ${target} został pomyślnie usunięty.`);
            } else {
                alert(`🗑️ Profil ${target} został pomyślnie usunięty.`);
            }

            this.renderProfilesListInModal();

            if (target === this.slug) {
                setTimeout(() => {
                    window.location.href = 'lumina-tablica.html';
                }, 1000);
            }
        },

        deleteCurrentProfileConfirm: function() {
            this.deleteProfile(this.slug);
        },

        promptCreateNewProfile: function() {
            const name = prompt('Podaj Imię i Nazwisko nowego użytkownika / profilu:');
            if (!name) return;
            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').trim() || ('user_' + Date.now());

            const newProfile = {
                slug: slug,
                name: name,
                role: 'Użytkownik Portalu',
                type: 'user',
                verified: false,
                avatar: 'icon.png'
            };

            let customUsers = [];
            try {
                customUsers = JSON.parse(localStorage.getItem('lumina_custom_users_list') || '[]');
            } catch(e) {}

            customUsers.push(newProfile);
            localStorage.setItem('lumina_custom_users_list', JSON.stringify(customUsers));

            localStorage.setItem('lumina_profile_' + slug, JSON.stringify({
                name: name,
                job: 'Użytkownik Portalu',
                verified: false,
                privacy: 'public',
                bio: 'Nowy profil w społeczności LUMINA.'
            }));

            if (typeof window.showToast === 'function') {
                window.showToast(`✨ Utworzono profil: ${name} (slug: ${slug})`);
            }

            this.renderProfilesListInModal();
            this.openFullEditor(slug);
        },

        // ══════════ MENEDŻER WSZYSTKICH PROFILI (MODAL) ══════════
        
        openPushNotificationModal: function() {
            this.closeModal('adminShieldQuickModal');
            document.getElementById('adminPushNotificationForm').reset();
            document.getElementById('adminPushRecurringOpts').style.display = 'none';
            document.getElementById('adminPushNotificationModal').style.display = 'flex';
            document.getElementById('adminPushNotificationModal').style.opacity = '1';
            document.getElementById('adminPushNotificationModal').style.visibility = 'visible';
        },
        submitPushNotification: function(e) {
            e.preventDefault();
            const title = document.getElementById('adminPushTitle').value.trim();
            const message = document.getElementById('adminPushContent').value.trim();
            const actionType = document.getElementById('adminPushActionType').value;
            const actionLink = document.getElementById('adminPushActionLink').value.trim() || '#';
            const audience = document.getElementById('adminPushAudience').value;

            const scheduleType = document.querySelector('input[name="adminPushScheduleType"]:checked').value;
            const interval = document.getElementById('adminPushInterval').value;
            const time = document.getElementById('adminPushTime').value;

            // Zbuduj strukturę powiadomienia
            const pushData = {
                title,
                message,
                actionType,
                audience,
                actionLink,
                scheduleType,
                interval: scheduleType === 'recurring' ? interval : null,
                time: scheduleType === 'recurring' ? time : null,
                createdAt: Date.now(),
                sender: this.slug || 'LUMINA_SYSTEM'
            };

            console.log('Sending PUSH Notification Config:', pushData);
            
            // Integracja z Firestore (zapis konfiguracji PUSH)
            if (window.LuminaDB && window.LuminaDB.db) {
                const { collection, addDoc } = require('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
                // UWAGA: wymaga dynamicznego importu lub użycia db bezpośrednio.
                // Uprośćmy: korzystamy z prekonfigurowanego LuminaDB jeśli istnieje:
                import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js').then(({ collection, addDoc }) => {
                    addDoc(collection(window.LuminaDB.db, 'push_notifications'), pushData).catch(err => console.error("Error saving PUSH:", err));
                }).catch(e => console.warn(e));
            }


            if (window.showToast) {
                if (scheduleType === 'once') {
                    window.showToast('🔔 Powiadomienie PUSH zostało wysłane pomyślnie!');
                    // Tu wpięcie w system notifications - dla celów demonstracyjnych symulujemy pusha po chwili
                    if (window.LuminaNotifications) {
                        setTimeout(() => {
                            window.LuminaNotifications.push(
                                "🔔 " + title,
                                message,
                                "logo-192x192.png",
                                actionLink
                            );
                        }, 1500);
                    }
                } else {
                    window.showToast('📅 Cykliczne powiadomienie zostało zaplanowane!');
                }
            } else {
                alert(scheduleType === 'once' ? 'Wysłano PUSH!' : 'Zaplanowano cyklicznego PUSHa!');
            }

            this.closeModal('adminPushNotificationModal');
        },
        openAllProfilesManager: function() {
            this.renderProfilesListInModal();
            this.openModal('adminAllProfilesModal');
        },

        renderProfilesListInModal: function(query = '') {
            const container = document.getElementById('adminProfilesListContainer');
            if (!container) return;

            const all = getAllRegisteredProfiles();
            const blocked = getBlockedProfiles();
            const q = (query || '').toLowerCase().trim();

            const filtered = all.filter(p => {
                if (!q) return true;
                return (p.name && p.name.toLowerCase().includes(q)) ||
                       (p.slug && p.slug.toLowerCase().includes(q)) ||
                       (p.role && p.role.toLowerCase().includes(q));
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">Nie znaleziono profili pasujących do wyszukiwania.</div>';
                return;
            }

            // Licz profile bez własnego zdjęcia
            const missingPhotoProfiles = filtered.filter(p => {
                const savedAvatar = localStorage.getItem('lumina_avatar_' + p.slug);
                const hasOwnAvatar = savedAvatar && savedAvatar !== 'lumina_icon.jpg' && savedAvatar !== 'icon.png';
                const hasProfileAvatar = p.avatar && p.avatar !== 'lumina_icon.jpg' && p.avatar !== 'icon.png';
                return !hasOwnAvatar && !hasProfileAvatar;
            });

            // Monit administratora — wyświetl banner jeśli są profile bez zdjęcia
            const adminBanner = missingPhotoProfiles.length > 0
                ? `<div style="display:flex; align-items:center; gap:10px; padding:12px 16px; border-radius:12px; background:rgba(234,179,8,0.12); border:1px solid rgba(234,179,8,0.4); margin-bottom:14px;">
                    <i class="fa-solid fa-triangle-exclamation" style="color:#facc15; font-size:1.1rem;"></i>
                    <div>
                        <div style="font-weight:800; color:#facc15; font-size:0.9rem;">⚠️ ${missingPhotoProfiles.length} profil(e/i) bez własnego zdjęcia profilowego</div>
                        <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Profile bez zdjęcia wyświetlają domyślne logo LUMINA. Administracyjnie wymagane jest uzupełnienie zdjęcia profilowego. Użyj przycisku <strong style="color:#fff;">📷 Awatar</strong> aby przypisać zdjęcie.</div>
                    </div>
                   </div>`
                : '';

            container.innerHTML = adminBanner + filtered.map(p => {
                const isBlocked = blocked.includes(p.slug.toLowerCase());
                const savedData = this.getCurrentData(p.slug);
                const displayName = savedData.name || p.name;
                const displayRole = savedData.job || p.role || 'Profil LUMINA';

                // Sprawdź czy profil ma własne zdjęcie
                const savedAvatar = localStorage.getItem('lumina_avatar_' + p.slug);
                const hasOwnAvatar = savedAvatar && savedAvatar !== 'lumina_icon.jpg' && savedAvatar !== 'icon.png';
                const hasProfileAvatar = p.avatar && p.avatar !== 'lumina_icon.jpg' && p.avatar !== 'icon.png';
                const isMissingPhoto = !hasOwnAvatar && !hasProfileAvatar;

                // Fallback: oficjalne logo LUMINA (zamiast icon.png)
                const avatarSrc = savedAvatar || p.avatar || 'lumina_icon.jpg';

                const profileUrl = (p.slug === 'andrzejthiel') ? 'lumina.andrzejthiel.html' :
                                   (p.slug === 'cezaryrgowski') ? 'lumina.cezaryrgowski.html' :
                                   (p.slug === 'wiolettarogowska') ? 'lumina.wiolettarogowska.html' :
                                   `lumina-profile.html?u=${p.slug}`;

                const missingPhotoBadge = isMissingPhoto
                    ? `<span title="Ten profil nie posiada własnego zdjęcia profilowego — administracyjnie wymagane uzupełnienie" style="font-size:0.68rem; padding:2px 7px; border-radius:6px; background:rgba(234,179,8,0.2); border:1px solid rgba(234,179,8,0.5); color:#facc15; font-weight:800; white-space:nowrap;">⚠️ Brak zdjęcia</span>`
                    : '';

                return `
                    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid ${isBlocked ? 'rgba(239,68,68,0.4)' : isMissingPhoto ? 'rgba(234,179,8,0.3)' : 'rgba(255,255,255,0.08)'}; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:12px; min-width:220px;">
                            <div style="position:relative; flex-shrink:0;">
                                <img src="${avatarSrc}" alt="${displayName}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1.5px solid ${isBlocked ? '#ef4444' : isMissingPhoto ? '#facc15' : 'rgba(250,204,21,0.6)'};" onerror="this.src='lumina_icon.jpg'">
                                ${isMissingPhoto ? '<span style="position:absolute; bottom:-2px; right:-2px; width:14px; height:14px; border-radius:50%; background:#facc15; display:flex; align-items:center; justify-content:center; font-size:8px; color:#000; font-weight:900; border:1.5px solid #111;" title="Brak własnego zdjęcia">!</span>' : ''}
                            </div>
                            <div>
                                <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                    <span style="font-weight:800; font-size:0.95rem; color:#fff;">${displayName}</span>
                                    ${savedData.verified !== false ? '<i class="fa-solid fa-circle-check" style="color:#38bdf8; font-size:0.80rem;" title="Zweryfikowany"></i>' : ''}
                                    ${isBlocked ? '<span style="font-size:0.70rem; padding:2px 6px; border-radius:6px; background:#ef4444; color:#fff; font-weight:800;">ZABLOKOWANY</span>' : ''}
                                    ${missingPhotoBadge}
                                </div>
                                <div style="font-size:0.75rem; color:#94a3b8;">${displayRole} • slug: <code>${p.slug}</code></div>
                            </div>
                        </div>

                        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                            <a href="${profileUrl}" target="_blank" class="admin-suite-btn" style="padding:6px 10px; font-size:0.75rem;" title="Otwórz profil">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i> Zobacz
                            </a>
                            <button type="button" class="admin-suite-btn ${isMissingPhoto ? 'btn-warn' : 'btn-cyan'}" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.promptChangeAvatarForSlug('${p.slug}')" title="${isMissingPhoto ? '⚠️ Brak zdjęcia! Kliknij aby przypisać zdjęcie profilowe' : 'Zmień zdjęcie / awatar tego profilu'}">
                                <i class="fa-solid fa-camera"></i> ${isMissingPhoto ? '⚠️ Dodaj zdjęcie' : 'Awatar'}
                            </button>
                            <button type="button" class="admin-suite-btn btn-gold" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.openFullEditor('${p.slug}')" title="Edytuj dane tego profilu">
                                <i class="fa-solid fa-pencil"></i> Edytuj
                            </button>
                            <button type="button" class="admin-suite-btn ${isBlocked ? 'btn-cyan' : 'btn-warn'}" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.toggleBlockProfile('${p.slug}')" title="${isBlocked ? 'Odblokuj' : 'Zablokuj'} profil">
                                <i class="fa-solid ${isBlocked ? 'fa-unlock' : 'fa-ban'}"></i> ${isBlocked ? 'Odblokuj' : 'Zablokuj'}
                            </button>
                            <button type="button" class="admin-suite-btn btn-danger" style="padding:6px 10px; font-size:0.75rem;" onclick="window.LuminaAdminSuite.deleteProfile('${p.slug}')" title="Usuń profil">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },


        // ══════════ MULTIMEDIA & PUBLIKACJE ══════════
        currentEditingSlug: null,

        promptChangeAvatarForSlug: function(slug) {
            this.currentEditingSlug = slug || this.slug;
            const input = document.getElementById('adminAvatarFileInput');
            if (input) {
                input.value = '';
                input.click();
            }
        },

        promptChangeCoverForSlug: function(slug) {
            this.currentEditingSlug = slug || this.slug;
            const input = document.getElementById('adminCoverFileInput');
            if (input) {
                input.value = '';
                input.click();
            }
        },

        compressAndProcessImage: function(file, maxDim, quality, callback) {
            if (!file) return;
            const isGif = file.type === 'image/gif' || (file.name && file.name.toLowerCase().endsWith('.gif'));
            if (isGif) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    callback(e.target.result);
                };
                reader.readAsDataURL(file);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let w = img.width;
                    let h = img.height;
                    if (w > maxDim || h > maxDim) {
                        if (w > h) {
                            h = Math.round((h * maxDim) / w);
                            w = maxDim;
                        } else {
                            w = Math.round((w * maxDim) / h);
                            h = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    callback(compressedDataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        },

        handleAvatarSelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const targetSlug = (this.currentEditingSlug || this.slug || 'profile_default').toLowerCase();

            this.compressAndProcessImage(file, 800, 0.85, async (dataUrl) => {
                // Update local storage
                localStorage.setItem('lumina_avatar_' + targetSlug, dataUrl);
                const cur = this.getCurrentData(targetSlug);
                const updated = { ...cur, avatar: dataUrl, slug: targetSlug };
                localStorage.setItem('lumina_profile_' + targetSlug, JSON.stringify(updated));

                // Save to Firestore Cloud
                if (window.LuminaDB?.saveProfileToCloud) {
                    await window.LuminaDB.saveProfileToCloud(targetSlug, updated);
                }

                // Update cloud profiles map on page
                if (window._cloudProfilesMap) {
                    window._cloudProfilesMap[targetSlug] = updated;
                }

                // Update DOM elements on page
                const targetCards = document.querySelectorAll(`[data-profile-slug="${targetSlug}"] .card-photo img, #card_profile_${targetSlug} .card-photo img, .avatar-img, .profile-avatar-img, #avatarImgEl`);
                targetCards.forEach(img => { img.src = dataUrl; });

                if (typeof window.syncAllProfilesToCarousel === 'function') {
                    window.syncAllProfilesToCarousel();
                }

                // Refresh modal list if open
                if (document.getElementById('adminAllProfilesModal')?.classList.contains('open')) {
                    this.renderProfilesListInModal();
                }

                if (typeof window.showToast === 'function') {
                    window.showToast(`📸 Zdjęcie dla profilu [${targetSlug}] zostało wgrane i zapisane w chmurze! ✨`);
                } else {
                    alert(`📸 Zdjęcie dla profilu [${targetSlug}] zostało zapisane!`);
                }
            });
        },

        handleCoverSelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const targetSlug = (this.currentEditingSlug || this.slug || 'profile_default').toLowerCase();

            this.compressAndProcessImage(file, 1400, 0.85, async (dataUrl) => {
                if (window.LuminaMediaStore) {
                    await window.LuminaMediaStore.setItem('lumina_cover_' + targetSlug, dataUrl);
                }
                try {
                    localStorage.setItem('lumina_cover_' + targetSlug, dataUrl);
                } catch(err) {}

                const cur = this.getCurrentData(targetSlug);
                const updated = { ...cur, cover: dataUrl, slug: targetSlug };
                try {
                    const safeUpdated = { ...updated };
                    if (dataUrl.length > 500000) safeUpdated.cover = 'indexeddb:lumina_cover_' + targetSlug;
                    localStorage.setItem('lumina_profile_' + targetSlug, JSON.stringify(safeUpdated));
                } catch(err) {}

                if (dataUrl.length < 800000 && window.LuminaDB?.saveProfileToCloud) {
                    await window.LuminaDB.saveProfileToCloud(targetSlug, updated);
                }

                const coverEls = document.querySelectorAll('.profile-cover, .cover-img, #coverImgEl, #coverPhotoEl');
                coverEls.forEach(el => {
                    if (el.tagName === 'IMG') el.src = dataUrl;
                    else el.style.backgroundImage = `url(${dataUrl})`;
                });

                if (typeof window.showToast === 'function') {
                    window.showToast(`🖼️ Zdjęcie w tle dla [${targetSlug}] zostało pomyślnie zaktualizowane i zapisane! ✨`);
                }
            });
        },

        handleGallerySelect: function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const targetSlug = (this.currentEditingSlug || this.slug || 'profile_default').toLowerCase();

            this.compressAndProcessImage(file, 1200, 0.85, async (dataUrl) => {
                const cur = this.getCurrentData(targetSlug);
                const gallery = cur.gallery || [];
                gallery.push(dataUrl);
                const updated = { ...cur, gallery: gallery, slug: targetSlug };
                localStorage.setItem('lumina_profile_' + targetSlug, JSON.stringify(updated));

                if (window.LuminaDB?.saveProfileToCloud) {
                    await window.LuminaDB.saveProfileToCloud(targetSlug, updated);
                }

                if (typeof window.showToast === 'function') {
                    window.showToast('🖼️ Dodano nowe zdjęcie do galerii profilu!');
                }
            });
        },

        openNewPostModal: function() {
            document.getElementById('adminPostModalHeaderTitle').textContent = `Nowy Wpis dla: ${this.slug}`;
            document.getElementById('adminEditPostId').value = '';
            document.getElementById('adminPostSeries').value = '';
            document.getElementById('adminPostTitle').value = '';
            document.getElementById('adminPostContent').value = '';
            document.getElementById('adminPostPrayer').value = '';
            this.openModal('adminUniversalPostModal');
        },

        savePostSubmit: function(e) {
            if (e && e.preventDefault) e.preventDefault();
            const series = document.getElementById('adminPostSeries').value.trim();
            const title = document.getElementById('adminPostTitle').value.trim();
            const content = document.getElementById('adminPostContent').value.trim();
            const prayer = document.getElementById('adminPostPrayer').value.trim();

            this.closeModal('adminUniversalPostModal');

            // Prepend new post dynamically to the feed
            const feedCol = document.querySelector('.main-feed-col, .feed-stream, .profile-feed');
            if (feedCol) {
                const article = document.createElement('article');
                article.className = 'feed-post-card';
                article.style.marginBottom = '20px';
                article.innerHTML = `
                    <div class="post-top-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="font-weight:800; font-size:0.95rem; color:#facc15;">${series || 'NOWY WPIS'}</div>
                        <span style="font-size:0.75rem; color:#94a3b8;">Przed chwilą • Publiczny</span>
                    </div>
                    <h2 class="post-title" style="font-size:1.4rem; font-weight:800; margin-bottom:12px; color:#fff;">${title}</h2>
                    <div class="post-text-content" style="font-size:0.94rem; color:#cbd5e1; line-height:1.7; white-space:pre-line; margin-bottom:14px;">${content}</div>
                    ${prayer ? `<div class="post-prayer-highlight" style="background:rgba(245,158,11,0.1); border-left:3px solid #f59e0b; padding:12px 14px; border-radius:8px; font-style:italic; color:#fef08a; margin-bottom:14px;">${prayer}</div>` : ''}
                `;
                feedCol.prepend(article);
            }

            if (typeof window.showToast === 'function') {
                window.showToast('✨ Wpis został pomyślnie opublikowany!');
            }
        },

        runSelfRepair: function() {
            if (window.LuminaAutoRepair && typeof window.LuminaAutoRepair.repairAll === 'function') {
                const report = window.LuminaAutoRepair.repairAll(true);
                const detailedInfo = `🛡️ Auto-Naprawa LUMINA:
• Stan: ${report.status.toUpperCase()}
• Przechwycone zdarzenia: ${report.errorsCaught}
• Wykonane procedury: ${report.healedEvents}
• Czas wykonania: ${report.durationMs} ms`;
                console.log(detailedInfo);
            } else {
                if (typeof window.showToast === 'function') {
                    window.showToast('🛡️ Silnik Auto-Naprawy przeskanował aplikację. Brak błędów!');
                }
            }
        }
    };

    // Automatyczna inicjalizacja po załadowaniu DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.LuminaAdminSuite.init());
    } else {
        window.LuminaAdminSuite.init();
    }
})();
