/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA BOTTOM NAV PWA MODULE (lumina-bottom-nav.js)
 * Pływający Dolny Pasek Nawigacyjny UX (Mobile-First) dla Ekosystemu LUMINA
 * 1. Odkrywaj | 2. Tablica | 3. Wiadomości (Koperta z Live Badge) | 4. Kanały CC | 5. Sklep CC | 6. Mój Profil
 * ══════════════════════════════════════════════════════════════════════════
 */
(() => {
    function setupAccessibleNavigation(nav, popup) {
        if (!nav || !popup) return;
        const more = nav.querySelector('#navTabMoreMenu');
        if (!more) return;
        nav.querySelectorAll('a, button').forEach(control => {
            control.setAttribute('aria-label', control.id === 'navTabMoreMenu' ? 'Więcej opcji LUMINA' : control.title);
            control.querySelectorAll('i').forEach(icon => icon.setAttribute('aria-hidden', 'true'));
            if (control.matches('a.active')) control.setAttribute('aria-current', 'page');
        });
        more.setAttribute('aria-controls', popup.id);
        const sync = () => more.setAttribute('aria-expanded', String(popup.classList.contains('open')));
        sync();
        new MutationObserver(sync).observe(popup, { attributes: true, attributeFilter: ['class'] });
        nav.ownerDocument.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !popup.classList.contains('open')) return;
            event.preventDefault();
            popup.classList.remove('open');
            more.classList.remove('active');
            sync();
            more.focus();
        });
    }
    if (document.getElementById('luminaBottomNav')) {
        document.getElementById('luminaBottomNav').remove();
    }

    // 1. Wstrzyknięcie Stylów CSS
    const styles = `
        
    /* ── LUMINA MOBILE TOP AUTH BAR (ZAŁÓŻ KONTO | LOGOWANIE) ── */
    .lumina-mobile-auth-bar {
        display: none;
    }

    @media (max-width: 900px) {
        .lumina-mobile-auth-bar {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 42px;
            background: linear-gradient(90deg, #131032 0%, #35084a 50%, #131032 100%);
            border-bottom: 1.5px solid rgba(236, 72, 153, 0.4);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
            position: sticky;
            top: 60px;
            left: 0;
            right: 0;
            z-index: 999;
            padding: 0 10px;
            box-sizing: border-box;
            user-select: none;
        }

        body.user-is-authenticated .lumina-mobile-auth-bar {
            display: none !important;
        }

        .mobile-auth-btn {
            background: transparent !important;
            border: none !important;
            color: #ffffff !important;
            font-family: 'Outfit', sans-serif !important;
            font-size: 0.82rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.8px !important;
            text-transform: uppercase !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            cursor: pointer !important;
            padding: 6px 10px !important;
            border-radius: 8px !important;
            text-decoration: none !important;
            transition: all 0.2s ease !important;
            -webkit-tap-highlight-color: transparent !important;
        }

        .mobile-auth-btn:active {
            transform: scale(0.96) !important;
            background: rgba(255, 255, 255, 0.12) !important;
        }

        .mobile-auth-btn.btn-reg {
            color: #fbcfe8 !important;
        }

        .mobile-auth-btn.btn-reg i {
            color: #f472b6 !important;
        }

        .mobile-auth-btn.btn-login {
            color: #fef08a !important;
        }

        .mobile-auth-btn.btn-login i {
            color: #facc15 !important;
        }

        .mobile-auth-sep {
            color: rgba(255, 255, 255, 0.25) !important;
            font-weight: 300 !important;
            font-size: 0.95rem !important;
            margin: 0 4px !important;
            user-select: none !important;
        }
    }

    /* ── LUMINA UNIVERSAL LIVE AUTH STATUS DIODE (ZIELONA = ZALOGOWANY / CZERWONA = WYLOGOWANY) ── */
    @keyframes luminaPulseRed {
        0% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.9), 0 0 0 rgba(239, 68, 68, 0.7); }
        50% { transform: scale(1.15); box-shadow: 0 0 18px rgba(239, 68, 68, 1), 0 0 12px rgba(239, 68, 68, 0.9); }
        100% { transform: scale(1); box-shadow: 0 0 10px rgba(239, 68, 68, 0.9), 0 0 0 rgba(239, 68, 68, 0.7); }
    }
    @keyframes luminaPulseGreen {
        0% { transform: scale(1); box-shadow: 0 0 10px rgba(34, 197, 94, 0.9); }
        50% { transform: scale(1.08); box-shadow: 0 0 18px rgba(34, 197, 94, 1); }
        100% { transform: scale(1); box-shadow: 0 0 10px rgba(34, 197, 94, 0.9); }
    }

    .user-nav-avatar .avatar-status-badge,
    .user-nav-avatar .avatar-status-badge.online,
    .user-nav-avatar .avatar-status-badge[data-status="online"] {
        position: absolute !important;
        bottom: 8px !important;
        right: 8px !important;
        width: 22px !important;
        height: 22px !important;
        border-radius: 50% !important;
        background: #22c55e !important;
        border: 3.5px solid #070e24 !important;
        box-shadow: 0 0 14px rgba(34, 197, 94, 0.95), 0 0 24px rgba(34, 197, 94, 0.6) !important;
        z-index: 45 !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        display: block !important;
        transition: all 0.3s ease !important;
    }

    .user-nav-avatar .avatar-status-badge.offline,
    .user-nav-avatar .avatar-status-badge[data-status="offline"],
    body:not(.user-is-authenticated) .user-nav-avatar .avatar-status-badge {
        background: #ef4444 !important;
        box-shadow: 0 0 14px rgba(239, 68, 68, 0.95), 0 0 24px rgba(239, 68, 68, 0.6) !important;
        animation: luminaPulseRed 1.8s infinite ease-in-out !important;
        cursor: pointer !important;
        pointer-events: auto !important;
    }

    /* Composer Avatar Status Dot */
    .composer-avatar-wrap {
        position: relative !important;
        overflow: visible !important;
    }
    .composer-status-dot {
        position: absolute !important;
        bottom: -2px !important;
        right: -2px !important;
        width: 14px !important;
        height: 14px !important;
        border-radius: 50% !important;
        border: 2.5px solid #0b142e !important;
        z-index: 20 !important;
        cursor: pointer !important;
        pointer-events: auto !important;
        transition: all 0.3s ease !important;
    }
    .composer-status-dot.online,
    body.user-is-authenticated .composer-status-dot {
        background: #22c55e !important;
        box-shadow: 0 0 8px #22c55e !important;
    }
    .composer-status-dot.offline,
    body:not(.user-is-authenticated) .composer-status-dot {
        background: #ef4444 !important;
        box-shadow: 0 0 8px #ef4444 !important;
        animation: luminaPulseRed 1.8s infinite ease-in-out !important;
    }

    /* Textual Status Pill in Profile Header */
    .lumina-auth-status-pill {
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 4px 12px !important;
        border-radius: 20px !important;
        font-size: 0.78rem !important;
        font-weight: 800 !important;
        font-family: 'Plus Jakarta Sans', sans-serif !important;
        transition: all 0.25s ease !important;
        cursor: pointer !important;
        text-decoration: none !important;
        line-height: 1.4 !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        user-select: none !important;
    }
    .lumina-auth-status-pill.online,
    body.user-is-authenticated .lumina-auth-status-pill {
        background: rgba(34, 197, 94, 0.16) !important;
        border: 1px solid rgba(34, 197, 94, 0.45) !important;
        color: #4ade80 !important;
    }
    .lumina-auth-status-pill.online:hover {
        background: rgba(34, 197, 94, 0.28) !important;
        border-color: #22c55e !important;
    }
    .lumina-auth-status-pill.offline,
    body:not(.user-is-authenticated) .lumina-auth-status-pill {
        background: rgba(239, 68, 68, 0.16) !important;
        border: 1px solid rgba(239, 68, 68, 0.45) !important;
        color: #fca5a5 !important;
    }
    .lumina-auth-status-pill.offline:hover {
        background: rgba(239, 68, 68, 0.3) !important;
        border-color: #ef4444 !important;
        transform: scale(1.03) !important;
    }

        /* ── LUMINA BOTTOM NAVIGATION BAR (Desktop Floating Dock & Mobile Bar) ── */
        .lumina-bottom-nav {
            position: fixed !important;
            bottom: 20px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            width: auto !important;
            min-width: 280px !important;
            max-width: 380px !important;
            height: 62px !important;
            background: rgba(9, 14, 30, 0.92) !important;
            backdrop-filter: blur(24px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
            border: 1.5px solid rgba(250, 204, 21, 0.35) !important;
            border-radius: 36px !important;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.8), 0 0 22px rgba(250, 204, 21, 0.18) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-around !important;
            padding: 0 16px !important;
            z-index: 10000 !important;
            transition: transform 0.3s ease, opacity 0.3s ease !important;
        }

        .lumina-nav-tab {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            text-decoration: none !important;
            color: #94a3b8 !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            position: relative !important;
            font-size: 0.72rem !important;
            font-weight: 600 !important;
            gap: 4px !important;
            background: none !important;
            border: none !important;
            height: 100% !important;
            padding: 6px 14px !important;
            border-radius: 20px !important;
            cursor: pointer !important;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .lumina-nav-tab:hover {
            color: #facc15 !important;
            transform: translateY(-2px) !important;
            background: rgba(255, 255, 255, 0.06) !important;
        }
        .lumina-nav-tab:hover i {
            color: #facc15 !important;
            transform: scale(1.15) !important;
        }
        .lumina-nav-tab i {
            font-size: 1.25rem !important;
            transition: transform 0.2s ease, color 0.2s ease !important;
        }
        .lumina-nav-tab.active {
            color: #facc15 !important;
        }
        .lumina-nav-tab:focus-visible {
            outline: 3px solid #facc15 !important;
            outline-offset: -4px !important;
        }
        .lumina-nav-tab.active i {
            color: #facc15 !important;
            transform: scale(1.12) !important;
            text-shadow: 0 0 12px rgba(250, 204, 21, 0.6) !important;
        }

        body {
            padding-bottom: calc(84px + env(safe-area-inset-bottom, 12px)) !important;
        }

        @media (max-width: 900px) {
            .lumina-bottom-nav {
                bottom: 0 !important;
                left: 0 !important;
                right: 0 !important;
                transform: none !important;
                width: 100% !important;
                min-width: unset !important;
                max-width: unset !important;
                height: calc(64px + env(safe-area-inset-bottom, 8px)) !important;
                border-radius: 0 !important;
                border-left: none !important;
                border-right: none !important;
                border-bottom: none !important;
                border-top: 1px solid rgba(250, 204, 21, 0.3) !important;
                padding: 0 4px !important;
                padding-bottom: env(safe-area-inset-bottom, 8px) !important;
                background: rgba(9, 14, 30, 0.95) !important;
                backdrop-filter: blur(32px) saturate(200%) !important;
                -webkit-backdrop-filter: blur(32px) saturate(200%) !important;
                box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.85), 0 0 20px rgba(250, 204, 21, 0.15) !important;
            }
            .lumina-nav-tab {
                font-size: 0.65rem !important;
                padding: 4px 6px !important;
                min-height: 48px !important;
                -webkit-tap-highlight-color: transparent !important;
            }
            .lumina-nav-tab:active {
                transform: scale(0.92) !important;
            }
            body {
                padding-bottom: calc(84px + env(safe-area-inset-bottom, 12px)) !important;
            }
        }

        /* ── POPUP MENU III TRZECH LINII (Centrum Mediów, TV & Profilu) ── */
        .lumina-bottom-menu-popup {
            position: fixed !important;
            bottom: calc(82px + env(safe-area-inset-bottom, 10px)) !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(12px) scale(0.95) !important;
            width: 380px !important;
            max-width: 95vw !important;
            max-height: calc(100dvh - 96px) !important;
            z-index: 10001 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            display: none;
            flex-direction: column !important;
            box-sizing: border-box !important;
        }

        .lumina-bottom-menu-popup.open {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(-50%) translateY(0) scale(1) !important;
        }

        .lumina-bottom-menu-card {
            background: rgba(11, 19, 41, 0.96) !important;
            backdrop-filter: blur(28px) saturate(190%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
            border: 1.5px solid rgba(250, 204, 21, 0.45) !important;
            border-radius: 26px !important;
            padding: 14px 14px 12px 14px !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(250, 204, 21, 0.25) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
            max-height: calc(100dvh - 96px) !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
            overscroll-behavior: contain !important;
            box-sizing: border-box !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(250, 204, 21, 0.35) transparent !important;
        }

        .lumina-bottom-menu-card::-webkit-scrollbar {
            width: 5px !important;
        }
        .lumina-bottom-menu-card::-webkit-scrollbar-thumb {
            background: rgba(250, 204, 21, 0.35) !important;
            border-radius: 6px !important;
        }

        .lumina-bottom-menu-header {
            position: sticky !important;
            top: -14px !important;
            z-index: 12 !important;
            background: rgba(11, 19, 41, 0.98) !important;
            margin: -14px -14px 4px -14px !important;
            padding: 14px 14px 10px 14px !important;
            border-top-left-radius: 24px !important;
            border-top-right-radius: 24px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
            flex-shrink: 0 !important;
        }

        .lumina-bottom-menu-title {
            font-size: 0.95rem !important;
            font-weight: 800 !important;
            color: #facc15 !important;
            font-family: 'Outfit', sans-serif !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        }

        .lumina-bottom-menu-close {
            background: rgba(255, 255, 255, 0.08) !important;
            border: none !important;
            color: #cbd5e1 !important;
            width: 44px !important;
            height: 44px !important;
            flex-shrink: 0 !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            font-size: 1.15rem !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.2s ease !important;
        }
        .lumina-bottom-menu-close:hover {
            background: rgba(239, 68, 68, 0.2) !important;
            color: #f87171 !important;
        }

        .lumina-bottom-menu-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 7px !important;
            margin-top: 4px !important;
        }

        .lumina-menu-btn {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            padding: 10px 12px !important;
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 16px !important;
            color: #ffffff !important;
            text-align: left !important;
            cursor: pointer !important;
            width: 100% !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            text-decoration: none !important;
            box-sizing: border-box !important;
        }

        .lumina-menu-btn:hover {
            background: rgba(250, 204, 21, 0.12) !important;
            border-color: rgba(250, 204, 21, 0.4) !important;
            transform: translateX(3px) !important;
        }

        .lumina-menu-btn-icon {
            width: 40px !important;
            height: 40px !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.15rem !important;
            flex-shrink: 0 !important;
        }

        .radio-icon-bg {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(236, 72, 153, 0.25)) !important;
            border: 1px solid rgba(245, 158, 11, 0.5) !important;
            color: #facc15 !important;
        }

        .tv-icon-bg {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.25)) !important;
            border: 1px solid rgba(239, 68, 68, 0.5) !important;
            color: #f87171 !important;
        }

        .vod-icon-bg {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(217, 119, 6, 0.28)) !important;
            border: 1px solid rgba(245, 158, 11, 0.55) !important;
            color: #facc15 !important;
        }

        .rolki-icon-bg {
            background: linear-gradient(135deg, rgba(236, 72, 153, 0.28), rgba(245, 158, 11, 0.28)) !important;
            border: 1px solid rgba(236, 72, 153, 0.55) !important;
            color: #facc15 !important;
        }

        .events-icon-bg {
            background: linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(234, 179, 8, 0.25)) !important;
            border: 1px solid rgba(250, 204, 21, 0.5) !important;
            color: #facc15 !important;
        }

        .profile-icon-bg {
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.25)) !important;
            border: 1px solid rgba(168, 85, 247, 0.5) !important;
            color: #c084fc !important;
        }

        .qna-icon-bg {
            background: linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(236, 72, 153, 0.25)) !important;
            border: 1px solid rgba(250, 204, 21, 0.5) !important;
            color: #facc15 !important;
        }

        .admin-icon-bg {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(250, 204, 21, 0.25)) !important;
            border: 1px solid rgba(16, 185, 129, 0.5) !important;
            color: #34d399 !important;
        }

        .lumina-menu-btn-content {
            flex: 1 !important;
            min-width: 0 !important;
        }

        .lumina-menu-btn-title {
            font-size: 0.88rem !important;
            font-weight: 800 !important;
            color: #ffffff !important;
            margin-bottom: 2px !important;
        }

        .lumina-menu-btn-sub {
            font-size: 0.72rem !important;
            color: #94a3b8 !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
        }

        .lumina-bottom-menu-footer {
            margin-top: 10px !important;
            padding-top: 10px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            font-size: 0.75rem !important;
            flex-shrink: 0 !important;
        }
        .lumina-menu-footer-security {
            color: #94a3b8 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            font-weight: 600 !important;
        }
        .lumina-menu-footer-security i {
            color: #facc15 !important;
        }
        .lumina-menu-footer-badge {
            font-weight: 800 !important;
            color: #facc15 !important;
            background: rgba(245, 158, 11, 0.18) !important;
            border: 1px solid rgba(245, 158, 11, 0.4) !important;
            padding: 3px 12px !important;
            border-radius: 12px !important;
            font-family: 'Outfit', sans-serif !important;
            letter-spacing: 0.4px !important;
        }

        @media (max-width: 900px) {
            .lumina-bottom-menu-popup {
                bottom: calc(68px + env(safe-area-inset-bottom, 10px)) !important;
                width: 95vw !important;
                max-width: 390px !important;
                max-height: calc(100dvh - calc(76px + env(safe-area-inset-bottom, 12px))) !important;
            }
            .lumina-bottom-menu-card {
                max-height: calc(100dvh - calc(76px + env(safe-area-inset-bottom, 12px))) !important;
                padding: 12px 12px 10px 12px !important;
            }
            .lumina-bottom-menu-header {
                top: -12px !important;
                margin: -12px -12px 4px -12px !important;
                padding: 12px 12px 8px 12px !important;
            }
        }

        /* ── Dolny pasek z podpisami i środkowym „+” (makieta 2026-10-11) ── */
        .lumina-bottom-nav--labels .lumina-nav-tab { gap: 3px !important; padding: 4px 2px !important; }
        .lumina-bottom-nav--labels .lumina-nav-label { display: block !important; font-size: 0.68rem !important; font-weight: 600 !important; line-height: 1 !important; letter-spacing: 0 !important; white-space: nowrap !important; }
        .lumina-bottom-nav--labels .lumina-nav-tab i { font-size: 1.2rem !important; }
        .lumina-bottom-nav--labels .lumina-nav-compose { flex: 0 0 72px !important; overflow: visible !important; background: none !important; }
        .lumina-bottom-nav--labels .lumina-nav-compose:hover { transform: none !important; background: none !important; }
        .lumina-nav-compose-circle { width: 56px !important; height: 56px !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; background: linear-gradient(135deg, #d4a94a, #b8862f) !important; color: #fff !important; box-shadow: 0 6px 18px rgba(184, 134, 47, 0.45) !important; transform: translateY(-14px) !important; border: 3px solid #fff !important; }
        .lumina-nav-compose-circle i { color: #fff !important; font-size: 1.5rem !important; text-shadow: none !important; }
        .lumina-nav-compose:focus-visible .lumina-nav-compose-circle { outline: 3px solid #2563eb !important; outline-offset: 3px !important; }

        /* ── LIGHT MODE STYLING DLA LUMINA BOTTOM NAV & POPUP ── */
        html[data-lumina-theme="light"] .lumina-bottom-nav,
        body.theme-lumina-light .lumina-bottom-nav {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(28px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
            border: 1.5px solid rgba(196, 163, 90, 0.35) !important;
            box-shadow: 0 12px 35px rgba(28, 25, 23, 0.12), 0 0 20px rgba(184, 142, 62, 0.15) !important;
        }

        html[data-lumina-theme="light"] .lumina-nav-tab,
        body.theme-lumina-light .lumina-nav-tab {
            color: #78716C !important;
        }

        html[data-lumina-theme="light"] .lumina-nav-tab.active,
        body.theme-lumina-light .lumina-nav-tab.active {
            color: #946E24 !important;
            background: rgba(184, 142, 62, 0.12) !important;
        }

        html[data-lumina-theme="light"] .lumina-nav-tab:hover,
        body.theme-lumina-light .lumina-nav-tab:hover {
            color: #B88E3E !important;
            background: rgba(184, 142, 62, 0.08) !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-card,
        body.theme-lumina-light .lumina-bottom-menu-card {
            background: rgba(255, 255, 255, 0.98) !important;
            backdrop-filter: blur(32px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
            border: 1.5px solid rgba(196, 163, 90, 0.45) !important;
            box-shadow: 0 24px 60px rgba(28, 25, 23, 0.18), 0 0 24px rgba(184, 142, 62, 0.16) !important;
            scrollbar-color: rgba(184, 142, 62, 0.35) transparent !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-card::-webkit-scrollbar-thumb,
        body.theme-lumina-light .lumina-bottom-menu-card::-webkit-scrollbar-thumb {
            background: rgba(184, 142, 62, 0.35) !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-header,
        body.theme-lumina-light .lumina-bottom-menu-header {
            background: #FFFFFF !important;
            border-bottom: 1px solid rgba(196, 163, 90, 0.22) !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-header span,
        body.theme-lumina-light .lumina-bottom-menu-header span,
        html[data-lumina-theme="light"] .lumina-bottom-menu-title,
        body.theme-lumina-light .lumina-bottom-menu-title {
            color: #946E24 !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-close,
        body.theme-lumina-light .lumina-bottom-menu-close {
            background: rgba(28, 25, 23, 0.06) !important;
            color: #57534E !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-close:hover,
        body.theme-lumina-light .lumina-bottom-menu-close:hover {
            background: rgba(239, 68, 68, 0.12) !important;
            color: #E11D48 !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-btn,
        body.theme-lumina-light .lumina-menu-btn {
            background: #FAF8F5 !important;
            border: 1px solid rgba(196, 163, 90, 0.24) !important;
            color: #1C1917 !important;
            box-shadow: 0 2px 6px rgba(28, 25, 23, 0.03) !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-btn:hover,
        body.theme-lumina-light .lumina-menu-btn:hover {
            background: #FFFFFF !important;
            border-color: #B88E3E !important;
            box-shadow: 0 4px 14px rgba(184, 142, 62, 0.2) !important;
            transform: translateX(3px) !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-btn-title,
        body.theme-lumina-light .lumina-menu-btn-title {
            color: #1C1917 !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-btn-sub,
        body.theme-lumina-light .lumina-menu-btn-sub {
            color: #57534E !important;
        }

        html[data-lumina-theme="light"] .radio-icon-bg,
        body.theme-lumina-light .radio-icon-bg {
            background: rgba(245, 158, 11, 0.14) !important;
            border: 1px solid rgba(245, 158, 11, 0.35) !important;
            color: #D97706 !important;
        }

        html[data-lumina-theme="light"] .tv-icon-bg,
        body.theme-lumina-light .tv-icon-bg {
            background: rgba(239, 68, 68, 0.14) !important;
            border: 1px solid rgba(239, 68, 68, 0.35) !important;
            color: #DC2626 !important;
        }

        html[data-lumina-theme="light"] .vod-icon-bg,
        body.theme-lumina-light .vod-icon-bg {
            background: rgba(245, 158, 11, 0.14) !important;
            border: 1px solid rgba(245, 158, 11, 0.35) !important;
            color: #D97706 !important;
        }

        html[data-lumina-theme="light"] .rolki-icon-bg,
        body.theme-lumina-light .rolki-icon-bg {
            background: rgba(236, 72, 153, 0.14) !important;
            border: 1px solid rgba(236, 72, 153, 0.35) !important;
            color: #DB2777 !important;
        }

        html[data-lumina-theme="light"] .events-icon-bg,
        body.theme-lumina-light .events-icon-bg {
            background: rgba(234, 179, 8, 0.14) !important;
            border: 1px solid rgba(234, 179, 8, 0.35) !important;
            color: #B45309 !important;
        }

        html[data-lumina-theme="light"] .profile-icon-bg,
        body.theme-lumina-light .profile-icon-bg {
            background: rgba(168, 85, 247, 0.14) !important;
            border: 1px solid rgba(168, 85, 247, 0.35) !important;
            color: #9333EA !important;
        }

        html[data-lumina-theme="light"] .qna-icon-bg,
        body.theme-lumina-light .qna-icon-bg {
            background: rgba(250, 204, 21, 0.14) !important;
            border: 1px solid rgba(250, 204, 21, 0.35) !important;
            color: #B45309 !important;
        }

        html[data-lumina-theme="light"] .admin-icon-bg,
        body.theme-lumina-light .admin-icon-bg {
            background: rgba(16, 185, 129, 0.14) !important;
            border: 1px solid rgba(16, 185, 129, 0.35) !important;
            color: #059669 !important;
        }

        html[data-lumina-theme="light"] .lumina-bottom-menu-footer,
        body.theme-lumina-light .lumina-bottom-menu-footer {
            border-top: 1px solid rgba(196, 163, 90, 0.22) !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-footer-security,
        body.theme-lumina-light .lumina-menu-footer-security {
            color: #57534E !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-footer-security i,
        body.theme-lumina-light .lumina-menu-footer-security i {
            color: #B88E3E !important;
        }

        html[data-lumina-theme="light"] .lumina-menu-footer-badge,
        body.theme-lumina-light .lumina-menu-footer-badge {
            background: rgba(184, 142, 62, 0.12) !important;
            border: 1px solid rgba(184, 142, 62, 0.35) !important;
            color: #946E24 !important;
        }

        /* ── PŁYWAJĄCY PRZEŁĄCZNIK MOTYWU (MIĘDZY PRZYCISKIEM CZATU A PRZEWIJANIEM STRONY) ── */
        .lumina-theme-switch-pill {
            position: fixed !important;
            bottom: 86px !important;
            right: 10px !important;
            left: auto !important;
            z-index: 99998 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 50px !important;
            height: 50px !important;
            min-width: 50px !important;
            min-height: 50px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            cursor: pointer !important;
            transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            user-select: none !important;
            -webkit-tap-highlight-color: transparent !important;
            outline: none !important;
            box-sizing: border-box !important;
            background: rgba(18, 18, 26, 0.92) !important;
            border: 1.5px solid rgba(212, 169, 74, 0.45) !important;
            color: #d4a94a !important;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 169, 74, 0.15) !important;
        }

        .lumina-theme-switch-pill span,
        .lumina-theme-switch-pill #luminaThemeLabel {
            display: none !important;
        }

        .lumina-theme-switch-pill .theme-icon,
        .lumina-theme-switch-pill i {
            font-size: 1.25rem !important;
            line-height: 1 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.25s ease !important;
            color: #d4a94a !important;
        }

        .lumina-theme-switch-pill:hover {
            transform: translateY(-2px) scale(1.08) !important;
        }

        .lumina-theme-switch-pill:hover .theme-icon,
        .lumina-theme-switch-pill:hover i {
            transform: rotate(18deg) scale(1.1) !important;
        }

        .lumina-theme-switch-pill:active {
            transform: translateY(0) scale(0.94) !important;
        }

        html[data-lumina-theme="light"] .lumina-theme-switch-pill,
        body.theme-lumina-light .lumina-theme-switch-pill {
            background: rgba(255, 255, 255, 0.95) !important;
            border: 1.5px solid rgba(184, 142, 62, 0.45) !important;
            color: #B88E3E !important;
            box-shadow: 0 6px 20px rgba(184, 142, 62, 0.18), 0 2px 6px rgba(0, 0, 0, 0.06) !important;
        }

        html[data-lumina-theme="light"] .lumina-theme-switch-pill i,
        body.theme-lumina-light .lumina-theme-switch-pill i {
            color: #B88E3E !important;
        }

        @media (max-width: 768px) {
            .lumina-theme-switch-pill {
                bottom: calc(142px + env(safe-area-inset-bottom, 8px)) !important;
                right: 10px !important;
                left: auto !important;
                width: 48px !important;
                height: 48px !important;
                min-width: 48px !important;
                min-height: 48px !important;
                padding: 0 !important;
            }
        }

        /* ── FLOATING CHAT BUBBLE BUTTON (NOWY PRZYCISK CZATU W SZKLE W DOKU) ── */
        .lumina-floating-chat-btn {
            position: fixed !important;
            bottom: 148px !important;
            right: 10px !important;
            width: 48px !important;
            height: 48px !important;
            min-width: 48px !important;
            min-height: 48px !important;
            max-width: 48px !important;
            max-height: 48px !important;
            border-radius: 50% !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            color: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            z-index: 99998 !important;
            transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease !important;
            -webkit-tap-highlight-color: transparent !important;
            outline: none !important;
            text-decoration: none !important;
            touch-action: manipulation !important;
            filter: drop-shadow(0 8px 22px rgba(168, 85, 247, 0.45)) drop-shadow(0 3px 10px rgba(0, 0, 0, 0.6)) !important;
        }
        .lumina-floating-chat-btn:hover {
            transform: scale(1.08) translateY(-2px) !important;
            filter: drop-shadow(0 12px 28px rgba(217, 70, 239, 0.65)) drop-shadow(0 4px 14px rgba(234, 179, 8, 0.5)) !important;
        }
        .lumina-floating-chat-btn:active {
            transform: scale(0.96) translateY(0) !important;
        }
        .lumina-floating-chat-btn:focus-visible {
            outline: 3px solid #EAB308 !important;
            outline-offset: 3px !important;
        }
        .lumina-floating-chat-btn img,
        .lumina-floating-chat-btn picture {
            width: 100% !important;
            height: 100% !important;
            border-radius: 50% !important;
            object-fit: contain !important;
            display: block !important;
            pointer-events: none !important;
            user-select: none !important;
        }
        /* Pulsująca zielona dioda online w prawym górnym rogu */
        .lumina-floating-chat-btn .cc-chat-fab-badge {
            position: absolute !important;
            top: 1px !important;
            right: 1px !important;
            width: 13px !important;
            height: 13px !important;
            border-radius: 50% !important;
            background: #22C55E !important;
            border: 2px solid #0B0F19 !important;
            box-shadow: 0 0 10px #22C55E !important;
            pointer-events: none !important;
            animation: ccChatPulse 2s infinite ease-in-out !important;
        }
        @keyframes ccChatPulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.22); opacity: 0.85; }
            100% { transform: scale(1); opacity: 1; }
        }
        /* Badge nieprzeczytanych wiadomości (z lewej u góry, by nie zasłaniać zielonej diody) */
        .lumina-floating-chat-badge {
            position: absolute !important;
            top: -2px !important;
            left: -2px !important;
            background: #ef4444 !important;
            color: #ffffff !important;
            font-size: 0.70rem !important;
            font-weight: 900 !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            min-width: 18px !important;
            height: 18px !important;
            padding: 0 4px !important;
            border-radius: 9px !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            border: 2px solid #090d1a !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5) !important;
            line-height: 1 !important;
            pointer-events: none !important;
            box-sizing: border-box !important;
            z-index: 10 !important;
        }
        .lumina-floating-chat-badge.visible,
        .lumina-floating-chat-badge[data-visible="true"] {
            display: flex !important;
        }

        @media (max-width: 768px) {
            .lumina-floating-chat-btn {
                bottom: calc(202px + env(safe-area-inset-bottom, 8px)) !important;
                right: 10px !important;
                width: 48px !important;
                height: 48px !important;
            }
        }

        /* Modale CC Network, Wiadomości & Sklep */
        .cc-nav-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(7, 14, 36, 0.88);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            z-index: 100001;
            align-items: center;
            justify-content: center;
            padding: 16px;
        }
        .cc-nav-modal.open {
            display: flex !important;
            animation: fadeInModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        /* ── POPUP DRAWER Q&A (Pytania i Odpowiedzi LUMINA) ── */
        .lumina-qna-drawer {
            position: fixed !important;
            bottom: 94px !important;
            left: 50% !important;
            transform: translateX(-50%) translateY(16px) scale(0.96) !important;
            width: 680px !important;
            max-width: 95vw !important;
            max-height: 80vh !important;
            z-index: 10002 !important;
            opacity: 0 !important;
            pointer-events: none !important;
            transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            display: none;
            flex-direction: column !important;
        }

        .lumina-qna-drawer.open {
            display: flex !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            transform: translateX(-50%) translateY(0) scale(1) !important;
        }

        .lumina-qna-card {
            background: rgba(11, 19, 41, 0.97) !important;
            backdrop-filter: blur(30px) saturate(190%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(190%) !important;
            border: 1.5px solid rgba(250, 204, 21, 0.45) !important;
            border-radius: 26px !important;
            padding: 20px 18px !important;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.95), 0 0 30px rgba(250, 204, 21, 0.25) !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
            max-height: 80vh !important;
            overflow: hidden !important;
        }

        .lumina-qna-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding-bottom: 12px !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
            flex-shrink: 0 !important;
        }

        .lumina-qna-title-box {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
        }

        .lumina-qna-icon {
            width: 38px !important;
            height: 38px !important;
            border-radius: 12px !important;
            background: linear-gradient(135deg, rgba(250, 204, 21, 0.25), rgba(236, 72, 153, 0.25)) !important;
            border: 1px solid rgba(250, 204, 21, 0.5) !important;
            color: #facc15 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 1.2rem !important;
            flex-shrink: 0 !important;
        }

        .lumina-qna-scroll {
            overflow-y: auto !important;
            padding-right: 4px !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            max-height: calc(80vh - 100px) !important;
            scrollbar-width: thin !important;
            scrollbar-color: rgba(250, 204, 21, 0.4) transparent !important;
        }
        .lumina-qna-scroll::-webkit-scrollbar {
            width: 5px !important;
        }
        .lumina-qna-scroll::-webkit-scrollbar-thumb {
            background: rgba(250, 204, 21, 0.4) !important;
            border-radius: 10px !important;
        }

        .lumina-qna-item {
            background: rgba(255, 255, 255, 0.04) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            transition: all 0.22s ease !important;
        }
        .lumina-qna-item[open] {
            background: rgba(250, 204, 21, 0.06) !important;
            border-color: rgba(250, 204, 21, 0.35) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        }

        .lumina-qna-summary {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: 12px 14px !important;
            cursor: pointer !important;
            user-select: none !important;
            gap: 10px !important;
            list-style: none !important;
        }
        .lumina-qna-summary::-webkit-details-marker {
            display: none !important;
        }

        .lumina-qna-q-title {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            font-family: 'Plus Jakarta Sans', sans-serif !important;
            font-size: 0.88rem !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            text-align: left !important;
            line-height: 1.35 !important;
        }

        .lumina-qna-num {
            width: 24px !important;
            height: 24px !important;
            border-radius: 50% !important;
            background: rgba(250, 204, 21, 0.2) !important;
            border: 1px solid rgba(250, 204, 21, 0.5) !important;
            color: #facc15 !important;
            font-size: 0.72rem !important;
            font-weight: 800 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }

        .lumina-qna-chevron {
            color: #94a3b8 !important;
            font-size: 0.85rem !important;
            transition: transform 0.25s ease !important;
            flex-shrink: 0 !important;
        }
        .lumina-qna-item[open] .lumina-qna-chevron {
            transform: rotate(180deg) !important;
            color: #facc15 !important;
        }

        .lumina-qna-answer {
            padding: 4px 14px 14px 44px !important;
            font-family: 'Inter', sans-serif !important;
            font-size: 0.82rem !important;
            color: #cbd5e1 !important;
            line-height: 1.6 !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
            margin-top: 4px !important;
        }
        .lumina-qna-answer p {
            margin: 6px 0 !important;
        }
        .lumina-qna-answer ul {
            margin: 6px 0 6px 16px !important;
            padding: 0 !important;
        }
        .lumina-qna-answer li {
            margin-bottom: 4px !important;
        }

        @media (max-width: 900px) {
            .lumina-qna-drawer {
                bottom: calc(76px + env(safe-area-inset-bottom, 10px)) !important;
                width: 95vw !important;
                max-height: 78vh !important;
            }
            .lumina-qna-card {
                padding: 16px 12px !important;
            }
            .lumina-qna-answer {
                padding: 4px 10px 12px 20px !important;
            }
        }

    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'lumina-bottom-nav-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // 2. Określenie Aktywnej Karty
    const pathname = window.location.pathname.toLowerCase();
    const isDiscover = pathname.includes('lumina.html') || (pathname.endsWith('/lumina') && !pathname.includes('tablica') && !pathname.includes('women') && !pathname.includes('osobowosc') && !pathname.includes('radiocc') && !pathname.includes('cctv') && !pathname.includes('ccmen'));
    const isTablica = pathname.includes('lumina-tablica') || /\/tablica\/?$/.test(pathname);
    const isShorts = pathname.includes('lumina-shorts') || pathname.includes('rolki') || pathname.includes('shorts');
    const isProfile = pathname.includes('lumina-profile') || pathname.includes('cezaryrgowski') || pathname.includes('wiolettarogowska');

    // Dynamiczny link do Mojego Profilu (inteligentne rozpoznawanie zalogowanego użytkownika)
    let myProfileHref = 'lumina.cezaryrgowski.html';
    try {
        let curUser = null;
        try { curUser = JSON.parse(localStorage.getItem('lumina_current_user') || 'null'); } catch(e) {}
        const isAdmin = localStorage.getItem('lumina_auth_master_admin') === 'true' 
            || sessionStorage.getItem('lumina_auth_master_admin') === 'true'
            || ((window.LuminaDB && typeof window.LuminaDB.detectLuminaOfficialIdentity === 'function') && window.LuminaDB.detectLuminaOfficialIdentity(window.LuminaDB.getCurrentUser && window.LuminaDB.getCurrentUser()) === 'cezary');
        const curProf = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
        
        if (isAdmin) {
            myProfileHref = 'lumina.cezaryrgowski.html';
        } else if (curProf && (curProf.slug || curProf.uid)) {
            const s = (curProf.slug || curProf.uid).toLowerCase();
            if (s === 'wiolettarogowska' || s.includes('wioletta')) {
                myProfileHref = 'lumina.wiolettarogowska.html';
            } else if (s === 'cezaryrgowski' || s.includes('cezary')) {
                myProfileHref = 'lumina.cezaryrgowski.html';
            } else if (s === 'marekjakubowski' || s.includes('marek') || s.includes('jakubowski')) {
                myProfileHref = 'lumina.marekjakubowski.html';
            } else {
                myProfileHref = `lumina-profile.html?u=${s}`;
            }
        } else {
            // Domyślny profil dla niezalogowanego gościa / nowy profil
            myProfileHref = 'lumina-profile.html?u=moj_profil';
        }
    } catch(e) {}

    // Stan nieprzeczytanych wiadomości
    const initialUnread = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);

    // 3. Wstrzyknięcie Struktury HTML
    const navHtml = `



        <!-- ══════════ POPUP ROZWIJANY Q&A (Pytania i Odpowiedzi LUMINA) ══════════ -->
        <div id="luminaQnaDrawer" class="lumina-qna-drawer">
            <div class="lumina-qna-card">
                <div class="lumina-qna-header">
                    <div class="lumina-qna-title-box">
                        <div class="lumina-qna-icon">
                            <i class="fa-solid fa-circle-question"></i>
                        </div>
                        <div>
                            <div style="font-family:'Outfit',sans-serif; font-weight:800; color:#facc15; font-size:1.05rem; letter-spacing:0.5px;">Q&A • BAZA WIEDZY LUMINA</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Najważniejsze pytania i odpowiedzi o portalu</div>
                        </div>
                    </div>
                    <button type="button" onclick="window.toggleLuminaQnaDrawer(event)" class="lumina-bottom-menu-close" title="Zamknij">&times;</button>
                </div>

                <div class="lumina-qna-scroll">
                    <!-- Q1 -->
                    <details class="lumina-qna-item" open>
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">1</span>
                                <span>Czym jest portal LUMINA i jaka jest jego misja?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p><strong>LUMINA (Christian Culture)</strong> to suwerenny, bezpieczny chrześcijański portal relacji i wartości, stanowiący czystą alternatywę dla świeckich platform społecznościowych (TikTok, Instagram, Facebook, Tinder).</p>
                            <p>Naszą misją jest łączenie ludzi wierzących na fundamencie Chrystusa w celu budowania trwałych małżeństw, chrześcijańskich przyjaźni, dzielenia się świadectwami wiary i wzajemnej modlitwy.</p>
                        </div>
                    </details>

                    <!-- Q2 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">2</span>
                                <span>Jak działa poznawanie ludzi i dopasowanie (Lumina Connect)?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>Lumina Connect opiera się na algorytmie <em>Explainable AI Match</em>, który analizuje wspólne fundamenty wiary (100%), życiowe cele (95%), wartości (92%) oraz lokalizację.</p>
                            <p>Zamiast płytkiego „swipe'owania”, oferujemy 3 bezstresowe akcje wejścia:</p>
                            <ul>
                                <li>👋 <strong>Poznajmy się:</strong> Delikatne chrześcijańskie przywitanie.</li>
                                <li>☕ <strong>Zaproś na kawę:</strong> Bezpośrednie zaproszenie na rozmowę.</li>
                                <li>🕊️ <strong>Pomódlmy się:</strong> Duchowe wsparcie i modlitwa wstawiennicza.</li>
                            </ul>
                        </div>
                    </details>

                    <!-- Q3 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">3</span>
                                <span>Czy korzystanie z portalu LUMINA jest bezpłatne?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p><strong>Tak, w 100% bezpłatne!</strong> Przeglądanie profili, publikowanie postów na Tablicy, wiadomości czatu, słuchanie 6 stacji radiowych oraz oglądanie filmów w kinie VOD są całkowicie darmowe i wolne od nachalnych reklam komercyjnych.</p>
                        </div>
                    </details>

                    <!-- Q4 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">4</span>
                                <span>Jak LUMINA dba o bezpieczeństwo i autentyczność (Zero Fake / Zero Botów)?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>Wdrożyliśmy zaawansowany <em>Lumina Trust System</em>:</p>
                            <ul>
                                <li>🛡️ <strong>Weryfikacja twarzy AI:</strong> Eliminacja fałszywych profili, memów i krajobrazów.</li>
                                <li>📱 <strong>Weryfikacja SMS:</strong> Potwierdzenie realności każdego użytkownika.</li>
                                <li>🔒 <strong>Zero tolerancji dla hejtu:</strong> Bezpieczna przestrzeń oparta na szacunku i prawie Bożym.</li>
                            </ul>
                        </div>
                    </details>

                    <!-- Q5 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">5</span>
                                <span>Czym jest Tablica Społeczności (Lumina Feed)?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>Tablica to centralny strumień inspiracji, na którym członkowie publikują świadectwa działania Boga, intencje modlitewne, werset dnia oraz codzienne rozważania biblijne Andrzeja Thiela i Cezarego Rogowskiego.</p>
                        </div>
                    </details>

                    <!-- Q6 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">6</span>
                                <span>Jakie multimedia są zintegrowane w portalu?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>Bezpośrednio w portalu możesz korzystać z:</p>
                            <ul>
                                <li>📻 <strong>6 Stacji Radia CC:</strong> Radio PL, Instrumental Worship, Radio Biblia Audio, Radio Global, Global Bible, Biblia Śpiewana.</li>
                                <li>📺 <strong>Telewizja CCTV24 Live:</strong> Całodobowy kanał uwielbienia i programów formacyjnych.</li>
                                <li>🍿 <strong>Kino VOD:</strong> Pełnometrażowe filmy fabularne z polskim lektorem.</li>
                            </ul>
                        </div>
                    </details>

                    <!-- Q7 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">7</span>
                                <span>Jak zainstalować portal LUMINA na telefonie (PWA)?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>LUMINA działa jako aplikacja progresywna (PWA):</p>
                            <ul>
                                <li>🤖 <strong>Android:</strong> W menu Chrome wybierz <em>„Dodaj do ekranu głównego”</em> lub <em>„Zainstaluj aplikację”</em>.</li>
                                <li>🍏 <strong>iPhone / iOS:</strong> W Safari kliknij ikonę <em>Udostępnij</em> (kwadrat ze strzałką w górę) i wybierz <em>„Do ekranu początkowego”</em>.</li>
                            </ul>
                        </div>
                    </details>

                    <!-- Q8 -->
                    <details class="lumina-qna-item">
                        <summary class="lumina-qna-summary">
                            <div class="lumina-qna-q-title">
                                <span class="lumina-qna-num">8</span>
                                <span>Jak mogę wesprzeć rozwój misji i portalu LUMINA?</span>
                            </div>
                            <div class="lumina-qna-chevron"><i class="fa-solid fa-chevron-down"></i></div>
                        </summary>
                        <div class="lumina-qna-answer">
                            <p>Możesz dołączyć do grona Mecenasów i Patronów na platformie <a href="https://patronite.pl/osobowoscplus" target="_blank" rel="noopener noreferrer" style="color:#facc15; font-weight:700; text-decoration:underline;">Patronite • Osobowość Plus</a>, wspierając budowę pierwszych niezależnych chrześcijańskich mediów w Polsce.</p>
                        </div>
                    </details>
                </div>
            </div>
        </div>

        <!-- ══════════ POPUP ROZWIJANY Z IKONY III TRZECH LINII (Menu Mediów, TV & Profilu) ══════════ -->
        <div id="luminaBottomMenuPopup" class="lumina-bottom-menu-popup" role="region" aria-labelledby="luminaBottomMenuTitle">
            <div class="lumina-bottom-menu-card">
                <div class="lumina-bottom-menu-header">
                    <span id="luminaBottomMenuTitle" class="lumina-bottom-menu-title">Centrum Mediów & Opcji</span>
                    <button type="button" onclick="window.toggleCcBottomNavMenu(event)" class="lumina-bottom-menu-close" title="Zamknij" aria-label="Zamknij menu Więcej">&times;</button>
                </div>
                <div class="lumina-bottom-menu-grid">
                    <!-- 1. Radio CC 24/7 -->
                    <button type="button" class="lumina-menu-btn" onclick="window.toggleRadio(); window.toggleCcBottomNavMenu(event);" title="Włącz / Wyłącz Radio Christian Culture 24/7">
                        <div class="lumina-menu-btn-icon radio-icon-bg">
                            <i class="fa-solid fa-radio" id="menuRadioNavIcon"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Radio CC 24/7</div>
                            <div class="lumina-menu-btn-sub" id="menuRadioStatusText">Muzyka Uwielbienia & Słowo</div>
                        </div>
                    </button>

                    <!-- 2. TV & Kanały CC -->
                    <button type="button" class="lumina-menu-btn" onclick="window.openCcNetworkModal(); window.toggleCcBottomNavMenu(event);" title="Kanały Nadawcze & YouTube Christian Culture NETWORK">
                        <div class="lumina-menu-btn-icon tv-icon-bg">
                            <i class="fa-solid fa-tv"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Telewizja & Sieć TV</div>
                            <div class="lumina-menu-btn-sub">CCTV24, Pasma & YouTube</div>
                        </div>
                    </button>

                    <!-- 3. VOD Christian Culture -->
                    <a href="https://polskieradio.cc/vod" target="_blank" rel="noopener noreferrer" class="lumina-menu-btn" onclick="if(window.toggleCcBottomNavMenu) window.toggleCcBottomNavMenu(event);" title="VOD Christian Culture – Mega Hity Kina 24/7">
                        <div class="lumina-menu-btn-icon vod-icon-bg">
                            <i class="fa-solid fa-film"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">VOD Christian Culture 🍿</div>
                            <div class="lumina-menu-btn-sub">Filmy Chrześcijańskie & Kino 24/7</div>
                        </div>
                    </a>

                    <!-- 4. Rolki Wiary (LUMINA Shorts 9:16) -->
                    <a href="/rolki" class="lumina-menu-btn" onclick="if(window.toggleCcBottomNavMenu) window.toggleCcBottomNavMenu(event);" title="Rolki Wiary • LUMINA Shorts 9:16">
                        <div class="lumina-menu-btn-icon rolki-icon-bg">
                            <i class="fa-solid fa-clapperboard"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title" style="display:flex; align-items:center; gap:6px;">
                                <span>Rolki Wiary 9:16</span>
                                <span style="font-size:0.65rem; background:#ef4444; color:#fff; padding:1px 6px; border-radius:8px; font-weight:800;">NOWOŚĆ</span>
                            </div>
                            <div class="lumina-menu-btn-sub">Świadectwa & Krótkie Wideo</div>
                        </div>
                    </a>

                    <!-- 5. Mój Profil / Ustawienia -->
                    <button type="button" class="lumina-menu-btn" onclick="window.handleBottomNavProfileClick(event); window.toggleCcBottomNavMenu(event);" title="Mój Profil / Panel Właściciela">
                        <div class="lumina-menu-btn-icon profile-icon-bg">
                            <i class="fa-solid fa-user-gear"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Mój Profil & Ustawienia</div>
                            <div class="lumina-menu-btn-sub">Edycja, Wiara & Konto</div>
                        </div>
                    </button>

                    <!-- 6. Q&A (Pytania i Odpowiedzi) -->
                    <button type="button" class="lumina-menu-btn" onclick="window.toggleLuminaQnaDrawer(event); window.toggleCcBottomNavMenu(event);" title="Pytania i Odpowiedzi (Q&A) • Baza Wiedzy LUMINA">
                        <div class="lumina-menu-btn-icon qna-icon-bg">
                            <i class="fa-solid fa-circle-question"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Pytania i Odpowiedzi (Q&A)</div>
                            <div class="lumina-menu-btn-sub">Baza Wiedzy & Bezpieczeństwo</div>
                        </div>
                    </button>

                    <!-- 7. Master Admin (dla Dowódcy / Master Admin) -->
                    <button type="button" class="lumina-menu-btn admin-menu-btn" onclick="window.triggerSecretAdminPrompt(event); window.toggleCcBottomNavMenu(event);" title="Panel Master Admin">
                        <div class="lumina-menu-btn-icon admin-icon-bg">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div class="lumina-menu-btn-content">
                            <div class="lumina-menu-btn-title">Master Admin 👑</div>
                            <div class="lumina-menu-btn-sub">Narzędzia & Telemetria</div>
                        </div>
                    </button>
                </div>
                <!-- Dolny pasek statusu z wersją i tarczą -->
                <div class="lumina-bottom-menu-footer">
                    <span class="lumina-menu-footer-security">
                        <i class="fa-solid fa-shield-halved"></i> LUMINA • Bezpieczeństwo
                    </span>
                    <span class="lumina-menu-footer-badge">
                        Wydanie v4.1.1
                    </span>
                </div>
            </div>
        </div>

        <nav class="lumina-bottom-nav lumina-bottom-nav--labels" id="luminaBottomNav" role="navigation" aria-label="Nawigacja dolna LUMINA">
            <!-- 1. Start -->
            <a href="/lumina" class="lumina-nav-tab ${isDiscover ? 'active' : ''}" id="navTabDiscover" onmouseenter="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/lumina')" ontouchstart="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/lumina')" title="Start">
                <i class="fa-solid fa-house"></i><span class="lumina-nav-label">Start</span>
            </a>

            <!-- 2. Tablica Społeczności -->
            <a href="/tablica" class="lumina-nav-tab ${isTablica ? 'active' : ''}" id="navTabFeed" onmouseenter="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/tablica')" ontouchstart="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/tablica')" title="Główna Tablica Społeczności">
                <i class="fa-solid fa-users"></i><span class="lumina-nav-label">Tablica</span>
            </a>

            <!-- 3. Napisz post (środkowy przycisk) -->
            <button type="button" class="lumina-nav-tab lumina-nav-compose" id="navTabCompose" aria-label="Napisz post" title="Napisz post" onclick="if (typeof window.openQuickPostComposer === 'function') { window.openQuickPostComposer('post'); } else { window.location.href = '/tablica?compose=first-post'; }">
                <span class="lumina-nav-compose-circle"><i class="fa-solid fa-plus"></i></span>
            </button>

            <!-- 4. Rolki Wiary (Shorts 9:16) -->
            <a href="/rolki" class="lumina-nav-tab ${isShorts ? 'active' : ''}" id="navTabShorts" onmouseenter="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/rolki')" ontouchstart="if(window.luminaPrefetchPage) window.luminaPrefetchPage('/rolki')" title="Rolki Wiary • LUMINA Shorts 9:16">
                <i class="fa-solid fa-clapperboard"></i><span class="lumina-nav-label">Rolki</span>
            </a>

            <!-- 5. Menu Więcej (Radio, TV, VOD, Profil, Q&A, Master Admin) -->
            <button type="button" class="lumina-nav-tab" id="navTabMoreMenu" onclick="window.toggleCcBottomNavMenu(event)" title="Więcej opcji (Radio, TV, Profil, Q&A, Master Admin)">
                <i class="fa-solid fa-bars" id="bottomNavBarsIcon"></i><span class="lumina-nav-label">Menu</span>
            </button>
        </nav>

        <!-- ══════════ MODAL DLA NIEZALOGOWANEGO GOŚCIA ══════════ -->
        <div class="cc-nav-modal" id="guestProfilePromptModal" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(245,158,11,0.5); border-radius:24px; padding:28px 22px; max-width:440px; width:92%; text-align:center; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#ec4899); margin:0 auto 14px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; color:#fff; box-shadow:0 0 20px rgba(245,158,11,0.4);">
                    <i class="fa-solid fa-user-lock"></i>
                </div>
                <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; margin-bottom:8px; color:#fff;">Twój Profil w LUMINA</h3>
                <p style="font-size:0.86rem; color:#cbd5e1; line-height:1.55; margin-bottom:20px;">
                    Aby zobaczyć swój profil, edytować dane lub publikować świadectwa, zaloguj się lub załóż bezpłatne konto chrześcijańskie w portalu.
                </p>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <button type="button" onclick="if(window.ccLoginWithGoogle) { window.ccLoginWithGoogle(); } else if(window.handleDirectGoogleLogin) { window.handleDirectGoogleLogin(); } else { window.location.href='lumina-login.html'; } document.getElementById('guestProfilePromptModal').classList.remove('open');" style="padding:13px; border-radius:20px; background:linear-gradient(135deg, #1e293b, #0f172a); border:1.5px solid #facc15; color:#fff; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:10px; box-shadow:0 4px 18px rgba(0,0,0,0.5), 0 0 14px rgba(250,204,21,0.25); transition:transform 0.2s;">
                        <svg style="width:20px; height:20px; flex-shrink:0;" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Zaloguj jednym kliknięciem przez Google</span>
                    </button>
                    <a href="lumina.html#login" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open'); if(window.openAuthModal) { window.openAuthModal(); return false; }" style="padding:12px; border-radius:20px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; font-weight:800; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.35);">
                        <i class="fa-solid fa-right-to-bracket"></i> Zaloguj się przez E-mail / PIN
                    </a>
                    <a href="lumina.html#register" onclick="document.getElementById('guestProfilePromptModal').classList.remove('open'); if(window.openQuickRegisterModal) { window.openQuickRegisterModal(); return false; }" style="padding:12px; border-radius:20px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#fff; font-weight:700; text-decoration:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fa-solid fa-user-plus"></i> Załóż Bezpłatne Konto
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL WIADOMOŚCI & CZATÓW ══════════ -->
        <div class="cc-nav-modal" id="modalCcMessages" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(236,72,153,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcMessages').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; z-index:10;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; padding-right:32px;">
                    <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #ec4899, #f59e0b); display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#fff; box-shadow:0 0 16px rgba(236,72,153,0.4);">
                        <i class="fa-solid fa-envelope-open-text"></i>
                    </div>
                    <div>
                        <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Wiadomości & Czat</h3>
                        <p style="font-size:0.78rem; color:#ec4899; margin:0; font-weight:700;">☕ Zaproszenia na Kawę i Bezpośrednie Rozmowy</p>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px;" id="ccMessagesModalList">
                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='/lumina';">
                        <img src="lumina_icon.jpg" alt="LUMINA" style="width:46px; height:46px; border-radius:50%; object-fit:cover; border:1.5px solid #facc15;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:800; font-size:0.92rem; color:#fff;">Zespół LUMINA</span>
                                <span style="font-size:0.72rem; color:#facc15; font-weight:700;">Oficjalne</span>
                            </div>
                            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">Witaj w portalu LUMINA! Szczęść Boże 🕊️</div>
                        </div>
                    </div>

                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:14px; display:flex; align-items:center; gap:12px; cursor:pointer;" onclick="window.location.href='/lumina/ccwomen';">
                        <img src="logo_cc_women.jpg?v=20260820" alt="CC Women" style="width:46px; height:46px; border-radius:50%; object-fit:cover; border:1.5px solid #ec4899;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-weight:800; font-size:0.92rem; color:#fff;">Wspólnota CC Women</span>
                                <span style="font-size:0.72rem; color:#94a3b8;">Grupa</span>
                            </div>
                            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:2px;">Codzienna modlitwa wstawiennicza kobiet ✨</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top:16px; text-align:center;">
                    <a href="lumina" style="display:inline-block; font-size:0.82rem; color:#facc15; text-decoration:none; font-weight:700;">
                        Odkryj nowe profile i zaproś kogoś na Kawę
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL CHRISTIAN CULTURE NETWORK ══════════ -->
        <div class="cc-nav-modal" id="modalCcNetwork" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(250,204,21,0.4); border-radius:24px; padding:24px 20px; max-width:540px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative;">
                <button type="button" onclick="document.getElementById('modalCcNetwork').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <div style="width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg, #f59e0b, #ef4444); display:flex; align-items:center; justify-content:center; font-size:1.3rem; color:#fff; box-shadow:0 0 16px rgba(245,158,11,0.4);">
                        <i class="fa-solid fa-tv"></i>
                    </div>
                    <div>
                        <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; color:#fff; margin:0;">Christian Culture NETWORK</h3>
                        <p style="font-size:0.78rem; color:#facc15; margin:0; font-weight:700;">Ponad 40 kanałów YouTube i stacji nadawczych</p>
                    </div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <a href="https://www.youtube.com/@RadioChristianCulture" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-radio" style="font-size:1.3rem; color:#f59e0b; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Polskie Radio Christian Culture</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Główna stacja radiowa 24/7 z muzyką uwielbienia i słowem</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@ChristianCultureTV" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-tv" style="font-size:1.3rem; color:#ef4444; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Christian Culture TV (CCTV24)</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Telewizja internetowa z pasmami wideo i transmisjami</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://polskieradio.cc/vod" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-film" style="font-size:1.3rem; color:#f59e0b; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">VOD Christian Culture • Kino 24/7</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Filmy chrześcijańskie, Mega Hity Kina z polskim lektorem</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@CCWomen-w7h" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-person-dress" style="font-size:1.3rem; color:#ec4899; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CC Women • Misja Kobiet</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Kobiety Wiary, świadectwa i modlitwa</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@CCMen7" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-shield-halved" style="font-size:1.3rem; color:#0ea5e9; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">CC MEN • Męska Wspólnota</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Mężczyźni w Chrystusie, odpowiedzialność i braterstwo</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="https://www.youtube.com/@osobowo%C5%9B%C4%87PLUS" target="_blank" rel="noopener noreferrer" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-brain" style="font-size:1.3rem; color:#8b5cf6; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">OSOBOWOŚĆ +</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Formacja tożsamości, psychologia i dojrzałość chrześcijańska</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>

                    <a href="modlitwa.html" class="network-item-link" style="display:flex; align-items:center; gap:14px; padding:12px 14px; border-radius:16px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); text-decoration:none; color:#fff; transition:background 0.2s;">
                        <i class="fa-solid fa-hands-praying" style="font-size:1.3rem; color:#38bdf8; width:28px; text-align:center;"></i>
                        <div style="flex:1;">
                            <div style="font-weight:800; font-size:0.92rem;">Zjednoczeni za Polskę • Modlitwa 21:00</div>
                            <div style="font-size:0.75rem; color:#94a3b8;">Codzienna modlitwa wstawiennicza o Ojczyznę</div>
                        </div>
                        <i class="fa-solid fa-chevron-right" style="color:#64748b; font-size:0.85rem;"></i>
                    </a>
                </div>
            </div>
        </div>

        <!-- ══════════ MODAL SKLEPU CHRISTIAN CULTURE ══════════ -->
        <div class="cc-nav-modal" id="modalCcStore" onclick="if(event.target===this) this.classList.remove('open')">
            <div style="background:#0b1838; border:1.5px solid rgba(56,189,248,0.4); border-radius:24px; padding:24px 20px; max-width:480px; width:94%; max-height:85vh; overflow-y:auto; box-shadow:0 24px 60px rgba(0,0,0,0.85); color:#fff; position:relative; text-align:center;">
                <button type="button" onclick="document.getElementById('modalCcStore').classList.remove('open')" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.08); border:none; color:#cbd5e1; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:1.1rem; display:flex; align-items:center; justify-content:center;">&times;</button>
                <div style="width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(168,85,247,0.2)); border:2px solid #38bdf8; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; font-size:1.6rem; color:#38bdf8; box-shadow:0 0 20px rgba(56,189,248,0.35);">
                    <i class="fa-solid fa-bag-shopping"></i>
                </div>
                <h3 style="font-family:'Outfit',sans-serif; font-size:1.35rem; font-weight:800; color:#fff; margin-bottom:6px;">Sklep Christian Culture</h3>
                <p style="font-size:0.85rem; color:#cbd5e1; margin-bottom:18px; line-height:1.5;">Kupując publikacje, muzykę i odzież z symbolami wiary, wspierasz rozwój ewangelizacji i darmowych mediów CC.</p>
                
                <a href="https://my-store-1009741.creator-spring.com/" target="_blank" rel="noopener noreferrer" style="display:block; width:100%; padding:12px 18px; border-radius:14px; background:linear-gradient(135deg, #38bdf8, #2563eb); color:#fff; text-decoration:none; font-weight:800; font-size:0.92rem; box-shadow:0 6px 20px rgba(56,189,248,0.35);">
                    Otwórz Sklep Creator Spring (Market CC) ➔
                </a>
            </div>
        </div>
    `;

    // 4. Globalne funkcje i Real-Time Live Badge dla Wiadomości Czatu (Pływający Dymek & Pasek Dolny)
    window.updateLuminaMessagesBadge = function(count) {
        const badge = document.getElementById('floatingChatBadge');
        const bottomBadge = document.getElementById('bottomNavMsgBadge');
        const profileBadges = Array.from(document.querySelectorAll('.profile-msg-badge, #btnProfileMessageBadge, .btn-msg-badge, .nav-msg-badge'));
        const rawNum = typeof count === 'number' ? count : parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        const num = Math.max(0, isNaN(rawNum) ? 0 : rawNum);
        
        [badge, bottomBadge, ...profileBadges].forEach(b => {
            if (!b) return;
            if (num > 0) {
                b.style.setProperty('display', 'flex', 'important');
                b.classList.add('visible');
                b.setAttribute('data-visible', 'true');
                b.textContent = num > 9 ? '9+' : String(num);
            } else {
                b.style.setProperty('display', 'none', 'important');
                b.classList.remove('visible');
                b.setAttribute('data-visible', 'false');
                b.textContent = '';
            }
        });

        localStorage.setItem('lumina_messages_unread_count', String(num));
    };

    window.openLuminaChatModal = function() {
        const unreadCount = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        const targetTab = unreadCount > 0 ? 'private' : null;

        if (typeof window.openDirectMessagesModal === 'function') {
            window.openDirectMessagesModal(targetTab);
        } else if (document.getElementById('directMessagesModal')) {
            const m = document.getElementById('directMessagesModal');
            m.classList.add('open');
            if (typeof window.switchMessengerMainTab === 'function') {
                window.switchMessengerMainTab(targetTab || 'private');
            }
        } else {
            window.openCcMessagesModal();
        }
    };

    window.openCcMessagesModal = function() {
        if (typeof window.openDirectMessagesModal === 'function' || document.getElementById('directMessagesModal')) {
            window.openLuminaChatModal();
            return;
        }
        const m = document.getElementById('modalCcMessages');
        if (m) m.classList.add('open');
        window.updateLuminaMessagesBadge(0);
    };

    window.openCcNetworkModal = function() {
        const m = document.getElementById('modalCcNetwork');
        if (m) m.classList.add('open');
    };

    window.openCcStoreModal = function() {
        const m = document.getElementById('modalCcStore');
        if (m) m.classList.add('open');
    };


    window.toggleLuminaQnaDrawer = function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const drawer = document.getElementById('luminaQnaDrawer');
        const qnaBtn = document.getElementById('navTabQnA');
        const menuPopup = document.getElementById('luminaBottomMenuPopup');
        const menuBtn = document.getElementById('navTabMoreMenu');
        if (!drawer) return;

        // Close menu popup if open
        if (menuPopup && menuPopup.classList.contains('open')) {
            menuPopup.classList.remove('open');
            if (menuBtn) menuBtn.classList.remove('active');
        }

        const isCurrentlyOpen = drawer.classList.contains('open');
        if (isCurrentlyOpen) {
            drawer.classList.remove('open');
            if (qnaBtn) qnaBtn.classList.remove('active');
        } else {
            drawer.classList.add('open');
            if (qnaBtn) qnaBtn.classList.add('active');
        }
    };

    window.toggleCcBottomNavMenu = function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        const popup = document.getElementById('luminaBottomMenuPopup');
        const menuBtn = document.getElementById('navTabMoreMenu');
        if (!popup) return;

        const isCurrentlyOpen = popup.classList.contains('open');
        if (isCurrentlyOpen) {
            popup.classList.remove('open');
            if (menuBtn) menuBtn.classList.remove('active');
        } else {
            popup.classList.add('open');
            if (menuBtn) menuBtn.classList.add('active');
        }
    };

    document.addEventListener('click', (e) => {
        const popup = document.getElementById('luminaBottomMenuPopup');
        const menuBtn = document.getElementById('navTabMoreMenu');
        if (popup && popup.classList.contains('open')) {
            if (!popup.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) {
                popup.classList.remove('open');
                if (menuBtn) menuBtn.classList.remove('active');
            }
        }
    });

    window.handleBottomNavProfileClick = function(event) {
        if (event) event.preventDefault();
        let curUser = null;
        try { curUser = JSON.parse(localStorage.getItem('lumina_current_user') || 'null'); } catch(e) {}
        const isAdmin = localStorage.getItem('lumina_auth_master_admin') === 'true' 
            || sessionStorage.getItem('lumina_auth_master_admin') === 'true'
            || ((window.LuminaDB && typeof window.LuminaDB.detectLuminaOfficialIdentity === 'function') && window.LuminaDB.detectLuminaOfficialIdentity(window.LuminaDB.getCurrentUser && window.LuminaDB.getCurrentUser()) === 'cezary');
        let curProf = null;
        try {
            curProf = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
        } catch(e) {}
        
        const hasSession = (localStorage.getItem('lumina_user_session') === 'active') || (curProf && (curProf.slug || curProf.uid)) || !!curUser;

        if (isAdmin || (curUser && (curUser.displayName === 'Cezary Rogowski' || (curUser.id && curUser.id.includes('cezary'))))) {
            window.location.href = 'lumina.cezaryrgowski.html';
            return;
        }

        if (curUser) {
            const dName = (curUser.displayName || '').toLowerCase();
            const mail = (curUser.email || '').toLowerCase();
            if (mail === 'marusjakubowski@gmail.com' || mail.includes('jakubowski') || dName.includes('marek jakubowski')) {
                window.location.href = 'lumina.marekjakubowski.html';
                return;
            }
            if (dName.includes('zbyszek') || mail.includes('zbyszek') || mail.includes('gieron')) {
                window.location.href = 'lumina.zbyszekgieron.html';
                return;
            }
            if (dName.includes('zofia') || mail.includes('zofia') || mail.includes('dudek')) {
                window.location.href = 'lumina.zofiadudek.html';
                return;
            }
        }

        if (hasSession && curProf && (curProf.slug || curProf.uid)) {
            const s = (curProf.slug || curProf.uid).toLowerCase();
            if (s === 'wiolettarogowska' || s.includes('wioletta')) {
                window.location.href = 'lumina.wiolettarogowska.html';
            } else if (s === 'cezaryrgowski' || s.includes('cezary')) {
                window.location.href = 'lumina.cezaryrgowski.html';
            } else if (s === 'marekjakubowski' || s.includes('marek') || s.includes('jakubowski')) {
                window.location.href = 'lumina.marekjakubowski.html';
            } else if (s === 'zbyszekgieron' || s.includes('zbyszek') || s.includes('gieron')) {
                window.location.href = 'lumina.zbyszekgieron.html';
            } else if (s === 'zofiadudek' || s.includes('zofia') || s.includes('dudek')) {
                window.location.href = 'lumina.zofiadudek.html';
            } else if (s === 'jolawojcik' || s.includes('jola')) {
                window.location.href = 'lumina.jolawojcik.html';
            } else if (s === 'andrzejthiel' || s.includes('thiel')) {
                window.location.href = 'lumina.andrzejthiel.html';
            } else {
                window.location.href = `lumina-profile.html?u=${s}`;
            }
            return;
        }

        // Niezalogowany gość -> Pokaż dedykowany modal z zaproszeniem do logowania/rejestracji!
        const modal = document.getElementById('guestProfilePromptModal');
        if (modal) {
            modal.classList.add('open');
        } else if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
        } else if (typeof window.openQuickRegisterModal === 'function') {
            window.openQuickRegisterModal();
        } else {
            window.location.href = 'lumina.html#login';
        }
    };

    // 5. Nasłuch zdarzeń w czasie rzeczywistym dla wiadomości czatu
    window.addEventListener('lumina:new_message', (e) => {
        const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        window.updateLuminaMessagesBadge(cur + 1);
    });

    window.addEventListener('lumina-push-message', (e) => {
        const cur = parseInt(localStorage.getItem('lumina_messages_unread_count') || '0', 10);
        window.updateLuminaMessagesBadge(cur + 1);
    });

    // Usuń ewentualne stare wersje paska nawigacji
    document.querySelectorAll('.lumina-mobile-nav, #mobileNav').forEach(el => el.remove());

    
    // ══════════════════════════════════════════════════════════════════════════
    // TAJNY SUBTELNY PRZYCISK & DOWIĄZANIA ADMINISTRATORA PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    const ADMIN_HASH = 'eec0ae2663b74fdb9fb9981e92f1b2cc2a8b42444d358776d872580c79454c91';

    window.triggerSecretAdminPrompt = async function(e) {
        if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

        // ══ PRIORYTET 1: Deleguj do LuminaAdminSuite gdy panel jest gotowy ══
        if (window.LuminaAdminSuite && typeof window.LuminaAdminSuite.openPinPrompt === 'function') {
            const isCurrentlyAdmin = (
                sessionStorage.getItem('lumina_auth_master_admin') === 'true' ||
                localStorage.getItem('lumina_auth_master_admin') === 'true'
            );
            if (isCurrentlyAdmin) {
                // Już zalogowany — otwieramy panel quickModal z Tarczą
                if (typeof window.LuminaAdminSuite.openAllProfilesManager === 'function') {
                    window.LuminaAdminSuite.openAllProfilesManager();
                } else {
                    window.LuminaAdminSuite.openPinPrompt();
                }
            } else {
                // Niezalogowany — uruchamiamy uwierzytelnienie via LuminaAdminSuite
                window.LuminaAdminSuite.openPinPrompt();
            }
            return;
        }

        // ══ FALLBACK: LuminaAdminSuite jeszcze niedostępne — własna weryfikacja PIN ══
        const isCurrentlyAdmin = (sessionStorage.getItem('lumina_auth_master_admin') === 'true' || localStorage.getItem('lumina_auth_master_admin') === 'true');
        if (isCurrentlyAdmin) {
            const confirmLock = confirm('👑 Jesteś obecnie zalogowany jako Główny Administrator Portalu LUMINA.\n\nCzy chcesz ZABLOKOWAĆ tryb Administratora i przejść do widoku zwykłego gościa?');
            if (confirmLock) {
                sessionStorage.removeItem('lumina_auth_master_admin');
                localStorage.removeItem('lumina_auth_master_admin');
                document.body.classList.remove('owner-mode-active');
                if (typeof window.checkOwnerAuthSession === 'function') window.checkOwnerAuthSession();
                const toastFn = window.showToast || window.luminaToast || alert;
                toastFn('🔒 Zablokowano tryb Administratora (Tryb Gościa)');
                setTimeout(() => window.location.reload(), 400);
            }
            return;
        }

        const inputPin = prompt('🔐 Autoryzacja Administratora Portalu LUMINA:');
        if (!inputPin) return;

        try {
            const msgBuffer = new TextEncoder().encode(inputPin.trim());
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            if (hash === ADMIN_HASH) {
                sessionStorage.setItem('lumina_auth_master_admin', 'true');
                localStorage.setItem('lumina_auth_master_admin', 'true');
                document.body.classList.add('owner-mode-active');
                if (typeof window.checkOwnerAuthSession === 'function') window.checkOwnerAuthSession();
                // Spróbuj otworzyć panel bezpośrednio jeśli suite załadowało się w tym czasie
                if (window.LuminaAdminSuite && typeof window.LuminaAdminSuite.checkAndApplyAdminState === 'function') {
                    window.LuminaAdminSuite.checkAndApplyAdminState();
                    if (typeof window.LuminaAdminSuite.openAllProfilesManager === 'function') {
                        window.LuminaAdminSuite.openAllProfilesManager();
                    }
                    const toastFn = window.showToast || window.luminaToast || alert;
                    toastFn('👑 Witaj Dowódco! Panel Master Admin aktywowany.');
                } else {
                    const toastFn = window.showToast || window.luminaToast || alert;
                    toastFn('👑 Witaj Dowódco! Panel Administratora Portalu Aktywowany.');
                    setTimeout(() => window.location.reload(), 500);
                }
            } else {
                const toastFn = window.showToast || window.luminaToast || alert;
                toastFn('❌ Błędny kod autoryzacji! Odmowa dostępu.');
            }
        } catch(err) {
            console.error('Błąd weryfikacji:', err);
        }
    };

    // Skrót klawiszowy: Ctrl + Shift + A lub Ctrl + Shift + E
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a' || e.key === 'E' || e.key === 'e')) {
            e.preventDefault();
            window.triggerSecretAdminPrompt();
        }
    });

    // Tajne podpięcie pod logo LUMINA w nagłówku
    setTimeout(() => {
        const brands = document.querySelectorAll('.nav-brand, .lumina-brand, #navBrandLogo, .nav-logo-wrap');
        brands.forEach(el => {
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                window.triggerSecretAdminPrompt();
            });
        });
    }, 1000);
    document.body.insertAdjacentHTML('beforeend', navHtml);
    setupAccessibleNavigation(document.getElementById('luminaBottomNav'), document.getElementById('luminaBottomMenuPopup'));

    // ══════════════════════════════════════════════════════════════════════════
    // GLOBALNY PRZYCISK CZATU CC DLA CAŁEGO EKOSYSTEMU I PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    try {
        if (!window.CCGlobalChatButton && !document.getElementById('ccGlobalChatScript') && !document.querySelector('script[src*="cc-global-chat-button"]')) {
            const chatScript = document.createElement('script');
            chatScript.id = 'ccGlobalChatScript';
            chatScript.src = '/components/cc-global-chat-button.js?v=20261111_premium_v10';
            chatScript.defer = true;
            document.head.appendChild(chatScript);
        }
    } catch(e) {}

    // ══════════════════════════════════════════════════════════════════════════
    // Pomocnik natychmiastowego pobierania w tle stron portalu LUMINA (Near-Zero Latency)
    window.luminaPrefetchPage = function(url) {
        if (!url || document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
        try {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        } catch(e){}
    };

    // ══════════════════════════════════════════════════════════════════════════
    // AUTO-INIEKCJA MINI-PLAYERA AUDIO DLA CAŁEGO PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    try {
        if (!document.querySelector('link[href*="lumina-mini-player.css"]')) {
            const lmpCss = document.createElement('link');
            lmpCss.id = 'luminaMiniPlayerCSS';
            lmpCss.rel = 'stylesheet';
            lmpCss.href = '/css/lumina-mini-player.css?v=20261029_fab_v2';
            document.head.appendChild(lmpCss);
        }
        if (!window.LuminaMiniPlayer && !document.querySelector('script[src*="lumina-mini-player.js"]')) {
            const lmpScript = document.createElement('script');
            lmpScript.id = 'luminaMiniPlayerScript';
            lmpScript.src = '/js/lumina-mini-player.js?v=20261013_fab_col_v1';
            lmpScript.defer = true;
            document.body.appendChild(lmpScript);
        }
    } catch(e) {
        console.warn('[LuminaBottomNav] Błąd auto-iniekcji Mini-Playera:', e);
    }
    // ══════════════════════════════════════════════════════════════════════════
    // GLOBALNY MOBILNY PASEK LOGOWANIA / REJESTRACJI (ZAŁÓŻ KONTO | LOGOWANIE)
    // ══════════════════════════════════════════════════════════════════════════
    window.triggerLuminaRegister = function(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const authModal = document.getElementById('authModal');
        if (typeof window.switchAuthTab === 'function' && authModal) {
            window.switchAuthTab('register');
            authModal.classList.add('open');
            authModal.style.display = 'flex';
        } else {
            window.location.href = 'lumina.html?auth=register';
        }
    };

    window.triggerLuminaLogin = function(e) {
        if (e && typeof e.preventDefault === 'function') e.preventDefault();
        const authModal = document.getElementById('authModal');
        if (typeof window.switchAuthTab === 'function' && authModal) {
            window.switchAuthTab('login');
            authModal.classList.add('open');
            authModal.style.display = 'flex';
        } else {
            window.location.href = 'lumina.html?auth=login';
        }
    };

    window.checkLuminaAuthState = function() {
        let isAuthenticated = false;
        let isMaster = false;

        // 1. Sprawdź tryb Administratora
        if (sessionStorage.getItem('lumina_auth_master_admin') === 'true' || 
            localStorage.getItem('lumina_auth_master_admin') === 'true') {
            isAuthenticated = true;
            isMaster = true;
        }

        // 2. Sprawdź zalogowanego użytkownika LuminaDB / Firebase
        if (!isAuthenticated && window.LuminaDB && typeof window.LuminaDB.getCurrentUser === 'function') {
            const u = window.LuminaDB.getCurrentUser();
            if (u && (u.uid || u.email)) isAuthenticated = true;
        }

        if (!isAuthenticated && window.firebaseAuth && window.firebaseAuth.currentUser) {
            isAuthenticated = true;
        }

        // 3. Sprawdź klucze pamięci podręcznej sesji użytkownika
        if (!isAuthenticated) {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && (k.startsWith('firebase:authUser:') || k === 'lumina_user_profile' || k === 'lumina_current_user_data' || k === 'lumina_current_user_profile')) {
                    const val = localStorage.getItem(k);
                    if (val && val !== 'null' && val !== '{}') {
                        isAuthenticated = true;
                        break;
                    }
                }
            }
        }

        // 0. Sprawdź czy to właściciel profilu (slug)
        let isProfileOwner = false;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const slug = urlParams.get('u') || (window.LuminaDB && typeof window.LuminaDB.getCurrentUserSlug === 'function' ? window.LuminaDB.getCurrentUserSlug() : null);
            if (slug && (sessionStorage.getItem('lumina_auth_owner_' + slug) === 'true' || localStorage.getItem('lumina_auth_owner_' + slug) === 'true')) {
                isProfileOwner = true;
                isAuthenticated = true;
            }
        } catch(e) {}

        // 4. Aktualizacja klas na body
        if (isAuthenticated) {
            document.body.classList.add('user-is-authenticated');
            document.body.classList.remove('user-is-guest');
            if (isMaster || isProfileOwner) document.body.classList.add('owner-mode-active');
        } else {
            document.body.classList.remove('user-is-authenticated');
            document.body.classList.add('user-is-guest');
            if (!isProfileOwner && !isMaster) {
                document.body.classList.remove('owner-mode-active');
            }
        }

        // 5. Pasek mobilny
        const bar = document.getElementById('luminaMobileAuthBar');
        if (bar) {
            if (isAuthenticated) {
                bar.style.setProperty('display', 'none', 'important');
            } else if (window.innerWidth <= 900) {
                bar.style.display = 'flex';
            }
        }

        // 6. 🔴/🟢 DIODA PRZY ZDJĘCIU PROFILOWYM — dotyczy WYŁĄCZNIE paska nawigacji i własnego profilu (nigdy nie fałszuje cudzego profilu)
        const isViewingOtherProfile = window.location.pathname.includes('lumina-profile') || window.location.search.includes('u=');
        if (!isViewingOtherProfile) {
            const avatarWraps = document.querySelectorAll('.head-top-row .avatar-wrap, .user-nav-avatar');
            avatarWraps.forEach(wrap => {
                let badge = wrap.querySelector('.avatar-status-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'avatar-status-badge';
                    wrap.appendChild(badge);
                }
                if (isAuthenticated) {
                    badge.className = 'avatar-status-badge online';
                    badge.setAttribute('data-status', 'online');
                    badge.setAttribute('title', isMaster ? '👑 Zalogowany (Główny Administrator Portalu)' : '🟢 Zalogowany (Aktywny w Społeczności)');
                } else {
                    badge.className = 'avatar-status-badge offline';
                    badge.setAttribute('data-status', 'offline');
                    badge.setAttribute('title', '🔴 Wylogowany • Kliknij tutaj, aby się zalogować!');
                }
            });
        }

        // 7. 🔴/🟢 DIODA W OKIENKU PUBLIKACJI POSTÓW (Composer)
        const composerWraps = document.querySelectorAll('.composer-avatar-wrap');
        composerWraps.forEach(wrap => {
            let dot = wrap.querySelector('.composer-status-dot');
            if (!dot) {
                dot = document.createElement('span');
                dot.className = 'composer-status-dot';
                wrap.appendChild(dot);
            }
            if (isAuthenticated) {
                dot.className = 'composer-status-dot online';
                dot.setAttribute('title', '🟢 Zalogowany — Możesz publikować wpisy');
            } else {
                dot.className = 'composer-status-dot offline';
                dot.setAttribute('title', '🔴 Wylogowany — Kliknij, aby się zalogować');
                dot.onclick = (e) => {
                    e.stopPropagation();
                    if (window.triggerSecretAdminPrompt) window.triggerSecretAdminPrompt(e);
                    else if (window.triggerLuminaLogin) window.triggerLuminaLogin(e);
                };
            }
        });

        // 8. Weryfikacja: nie wstrzykujemy sztucznych pigułek logowania do cudzego profilu (eliminacja fikcji)

        // 9. 🧡 UNIWERSALNY PRZYCISK: ZOSTAŃ PATRONEM (Patronite)
        // Gwarantuje obecność przycisku na KAŻDYM obecnym i przyszłym profilu
        if (typeof window.injectUniversalPatroniteButton === 'function') {
            window.injectUniversalPatroniteButton();
        }
    };

    window.injectUniversalPatroniteButton = function() {
        const headActionsContainers = document.querySelectorAll('.head-actions, .head-actions-row');
        if (!headActionsContainers.length) return;

        headActionsContainers.forEach(container => {
            if (container.querySelector('.btn-action-patronite') || container.querySelector('a[href*="patronite.pl/osobowoscplus"]')) return;

            const patronBtn = document.createElement('a');
            patronBtn.href = 'https://patronite.pl/osobowoscplus';
            patronBtn.target = '_blank';
            patronBtn.rel = 'noopener noreferrer';
            patronBtn.style.cssText = 'background:linear-gradient(135deg, #f97316, #ea580c); border:none; color:#fff; font-weight:800; display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:0 18px; height:42px; border-radius:24px; text-decoration:none; box-shadow:0 4px 14px rgba(249,115,22,0.35); transition:all 0.25s ease; white-space:nowrap; flex-shrink:0; font-size:0.84rem; cursor:pointer;';
            patronBtn.innerHTML = '<i class="fa-solid fa-heart-circle-plus" style="color:#fef08a; font-size:0.95rem;"></i> <span class="btn-text">Zostań Patronem</span>';
            patronBtn.title = 'Wspieraj misję na Patronite (patronite.pl/osobowoscplus)';

            // Umieść za przyciskiem Kawa / Wiadomość lub na początku
            const coffeeBtn = container.querySelector('[onclick*="Coffee"], [onclick*="coffee"]');
            const msgBtn = container.querySelector('[onclick*="Message"], [onclick*="message"], .btn-action-primary');
            if (coffeeBtn && coffeeBtn.nextSibling) {
                container.insertBefore(patronBtn, coffeeBtn.nextSibling);
            } else if (msgBtn && msgBtn.nextSibling) {
                container.insertBefore(patronBtn, msgBtn.nextSibling);
            } else {
                container.appendChild(patronBtn);
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window.injectUniversalPatroniteButton === 'function') window.injectUniversalPatroniteButton();
        });
    } else {
        if (typeof window.injectUniversalPatroniteButton === 'function') window.injectUniversalPatroniteButton();
    }

    // Wstrzyknięcie Paska do DOM (pod nagłówek)
    function injectMobileAuthBar() {
        if (document.getElementById('luminaMobileAuthBar')) return;

        const barHtml = `
            <div id="luminaMobileAuthBar" class="lumina-mobile-auth-bar">
                <button type="button" class="mobile-auth-btn btn-reg" onclick="window.triggerLuminaRegister(event)">
                    <i class="fa-solid fa-sparkles"></i> ZAŁÓŻ KONTO
                </button>
                <span class="mobile-auth-sep">|</span>
                <button type="button" class="mobile-auth-btn btn-login" onclick="window.triggerLuminaLogin(event)">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> LOGOWANIE
                </button>
            </div>
        `;

        // Znajdź górny navbar (.portal-nav lub .profile-navbar lub nav)
        const topNav = document.querySelector('.portal-nav, .profile-navbar, nav');
        if (topNav && topNav.parentNode) {
            topNav.insertAdjacentHTML('afterend', barHtml);
        } else {
            document.body.insertAdjacentHTML('afterbegin', barHtml);
        }

        window.checkLuminaAuthState();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectMobileAuthBar();
            window.checkLuminaAuthState();
        });
    } else {
        injectMobileAuthBar();
        window.checkLuminaAuthState();
    }

    // Nasłuchiwanie zmian sesji
    window.addEventListener('lumina_auth_changed', window.checkLuminaAuthState);
    window.addEventListener('storage', window.checkLuminaAuthState);
    window.addEventListener('resize', window.checkLuminaAuthState);
    // Event-driven auth check (saves 100% CPU on mobile idle)
    window.addEventListener('focus', function() { if (typeof window.checkLuminaAuthState === 'function') window.checkLuminaAuthState(); });
    setInterval(function() { if (typeof window.checkLuminaAuthState === 'function') window.checkLuminaAuthState(); }, 20000);

    // ══════════════════════════════════════════════════════════════════════════
    // GOOGLE CONSENT MODE V2 & RODO BANNER PORTALU LUMINA
    // ══════════════════════════════════════════════════════════════════════════
    window.acceptLuminaCookies = function() {
        try { localStorage.setItem('lumina_cookie_consent', 'granted'); } catch(e) {}
        if (typeof window.gtag === 'function') {
            try {
                window.gtag('consent', 'update', {
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted',
                    'analytics_storage': 'granted'
                });
            } catch(e) {}
        }
        const b1 = document.getElementById('luminaCookieConsentBanner');
        if (b1) { b1.style.opacity = '0'; setTimeout(() => b1.remove(), 200); }
        const b2 = document.getElementById('lumina-cookie-banner');
        if (b2) { b2.style.opacity = '0'; setTimeout(() => b2.remove(), 200); }
    };

    function injectCookieConsentBanner() {
        if (localStorage.getItem('lumina_cookie_consent') === 'granted') {
            if (typeof window.gtag === 'function') {
                try {
                    window.gtag('consent', 'update', {
                        'ad_storage': 'granted',
                        'ad_user_data': 'granted',
                        'ad_personalization': 'granted',
                        'analytics_storage': 'granted'
                    });
                } catch(e) {}
            }
            return;
        }

        if (document.getElementById('luminaCookieConsentBanner') || document.getElementById('lumina-cookie-banner')) return;

        // Positioned directly ABOVE the detailed cookie banner (jedno pod drugim)
        const bannerHtml = `
            <div id="luminaCookieConsentBanner" style="position:fixed; bottom:145px; right:20px; max-width:460px; background:rgba(9,14,30,0.96); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); border:1px solid rgba(250,204,21,0.45); border-radius:16px; padding:12px 16px; box-shadow:0 12px 35px rgba(0,0,0,0.8); z-index:9999999; display:flex; align-items:center; justify-content:space-between; gap:12px; font-family:'Plus Jakarta Sans',sans-serif; color:#e2e8f0; transition:all 0.3s ease;">
                <div style="font-size:0.8rem; line-height:1.4; flex:1;">
                    <i class="fa-solid fa-shield-halved" style="color:#facc15; margin-right:4px;"></i>
                    Portal <b>LUMINA</b> szanuje Twoją prywatność. Używamy plików cookies i analityki do prawidłowego działania serwisu.
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                    <button type="button" onclick="window.acceptLuminaCookies()" style="background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#fff; font-weight:800; font-size:0.78rem; padding:8px 14px; border-radius:10px; cursor:pointer; font-family:inherit; box-shadow:0 4px 12px rgba(245,158,11,0.35); white-space:nowrap;">
                        Zgadzam się ➔
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', bannerHtml);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            injectCookieConsentBanner();
            loadLuminaRadioScript();
        });
    } else {
        injectCookieConsentBanner();
        loadLuminaRadioScript();
    }

    function loadLuminaRadioScript() {
        if (window.LuminaRadioEngineInitialized) return;
        if (!document.querySelector('script[src*="lumina-radio.js"]')) {
            const radioScript = document.createElement('script');
            radioScript.src = 'lumina-radio.js?v=' + Date.now();
            radioScript.defer = true;
            document.body.appendChild(radioScript);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // LUMINA MEDIA STORE (IndexedDB Storage for Large Avatars, GIFs and Videos)
    // ══════════════════════════════════════════════════════════════════════════
    window.LuminaMediaStore = {
        dbPromise: null,
        getDB() {
            if (!this.dbPromise) {
                this.dbPromise = new Promise((resolve, reject) => {
                    if (!window.indexedDB) return resolve(null);
                    const req = indexedDB.open('LuminaMediaStore', 1);
                    req.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains('media')) {
                            db.createObjectStore('media');
                        }
                    };
                    req.onsuccess = (e) => resolve(e.target.result);
                    req.onerror = (e) => resolve(null);
                });
            }
            return this.dbPromise;
        },
        async setItem(key, data) {
            try {
                const db = await this.getDB();
                if (!db) return false;
                return new Promise((resolve) => {
                    const tx = db.transaction('media', 'readwrite');
                    const store = tx.objectStore('media');
                    const req = store.put(data, key);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                });
            } catch(e) {
                return false;
            }
        },
        async getItem(key) {
            try {
                const db = await this.getDB();
                if (!db) return null;
                return new Promise((resolve) => {
                    const tx = db.transaction('media', 'readonly');
                    const store = tx.objectStore('media');
                    const req = store.get(key);
                    req.onsuccess = () => resolve(req.result || null);
                    req.onerror = () => resolve(null);
                });
            } catch(e) {
                return null;
            }
        }
    };

})();
