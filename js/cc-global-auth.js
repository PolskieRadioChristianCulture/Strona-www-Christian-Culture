/**
 * ══════════════════════════════════════════════════════════════════════════
 * CHRISTIAN CULTURE & LUMINA UNIVERSAL GOOGLE AUTH CONNECTOR
 * Plik: js/cc-global-auth.js
 * 
 * Umożliwia logowanie jednym kliknięciem przez Google na WSZYSTKICH
 * podstronach i usługach ekosystemu Christian Culture (Radio, VOD,
 * Modlitwa, Transmisje, Portal LUMINA), automatycznie powiększając
 * grono społeczności portalu LUMINA.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    if (window._ccGlobalAuthInitialized) return;
    window._ccGlobalAuthInitialized = true;

    // Auto-load Course Theme Controller on all course & academy pages
    if (/\/kursy|\/akademia|\/0[1-9]-|\/1[0-9]-|\/2[0-8]-/i.test(window.location.pathname)) {
        if (!document.getElementById('ccCourseThemeScript') && !window.CCCourseTheme && !window.CCCourseThemeLoaded && !document.querySelector('script[src*="cc-course-theme"]')) {
            const themeScript = document.createElement('script');
            themeScript.id = 'ccCourseThemeScript';
            themeScript.src = '/js/cc-course-theme.js?v=20261008_theme1';
            document.head.appendChild(themeScript);
        }
    }

    // 1. Wstrzyknięcie Stylów CSS Glassmorphism
    const styleEl = document.createElement('style');
    styleEl.id = 'ccGlobalAuthStyles';
    styleEl.textContent = `
        /* ── CC & LUMINA UNIVERSAL AUTH WIDGET ── */
        .cc-auth-widget-container {
            display: inline-flex;
            align-items: center;
            position: relative;
            z-index: 1000;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            -webkit-tap-highlight-color: transparent;
        }

        /* Przycisk Logowania przez Google - Standard @SE26/27 Obsidian & Imperial Gold */
        .cc-auth-google-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(165deg, rgba(18, 18, 20, 0.98) 0%, rgba(8, 8, 10, 0.99) 100%);
            border: 1.5px solid rgba(212, 175, 55, 0.35);
            color: #ffffff;
            padding: 6px 14px 6px 10px;
            border-radius: 24px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5), 0 0 14px rgba(212, 175, 55, 0.12);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            user-select: none;
            white-space: nowrap;
            min-height: 38px;
        }

        .cc-auth-google-btn:hover {
            border-color: #d4af37;
            background: linear-gradient(165deg, rgba(28, 28, 32, 0.98) 0%, rgba(16, 16, 18, 0.98) 100%);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.65), 0 0 20px rgba(212, 175, 55, 0.3);
            transform: translateY(-1.5px) scale(1.02);
            color: #ffffff;
        }

        .cc-auth-google-btn:active {
            transform: translateY(0) scale(0.98);
        }

        .cc-google-icon-svg {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        }

        .cc-auth-lumina-tag {
            background: linear-gradient(135deg, #d4af37, #f3e5ab);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 0.68rem;
            font-weight: 900;
            letter-spacing: 0.8px;
            text-transform: uppercase;
            padding-left: 2px;
            border-left: 1px solid rgba(212, 175, 55, 0.25);
            margin-left: 2px;
        }

        /* Kontener nadrzędny - przezroczysty, zerowy obrys (ochrona przed podwójną ramką) */
        .user-nav-profile,
        #userNavProfile,
        .cc-auth-widget-container,
        [data-cc-auth-mount] {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
        }

        /* Stan Zalogowany: WŁAŚCIWA JEDYNA Pigułka Logowania - Standard @SE26/27 Obsidian & Imperial Gold */
        .cc-auth-user-pill,
        .user-nav-profile.cc-auth-user-pill {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            background: linear-gradient(165deg, rgba(16, 16, 18, 0.98) 0%, rgba(9, 9, 11, 0.99) 100%) !important;
            border: 1px solid rgba(212, 175, 55, 0.25) !important;
            border-radius: 9999px !important;
            padding: 3px 10px 3px 4px !important;
            color: #ffffff !important;
            cursor: pointer !important;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px rgba(212, 175, 55, 0.10), inset 0 1px 1px rgba(255, 235, 170, 0.18) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            transition: all 0.25s ease !important;
            user-select: none !important;
            min-height: 36px !important;
            height: 36px !important;
            box-sizing: border-box !important;
            max-width: 155px !important;
            text-decoration: none !important;
        }

        .cc-auth-user-pill:hover,
        .user-nav-profile.cc-auth-user-pill:hover {
            border-color: rgba(212, 175, 55, 0.45) !important;
            background: linear-gradient(165deg, rgba(24, 24, 28, 0.98) 0%, rgba(14, 14, 16, 0.99) 100%) !important;
            box-shadow: 0 6px 18px rgba(0,0,0,0.65), 0 0 16px rgba(212, 175, 55, 0.20), inset 0 1px 1px rgba(255, 235, 170, 0.25) !important;
        }

        .cc-auth-avatar-wrap,
        .user-nav-avatar-wrap {
            position: relative !important;
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            border-radius: 50% !important;
            flex-shrink: 0 !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .cc-auth-avatar-img,
        .user-nav-avatar,
        .cc-auth-user-pill .user-nav-avatar,
        .user-nav-profile .user-nav-avatar {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            max-width: 28px !important;
            border-radius: 50% !important;
            object-fit: cover !important;
            border: 1.5px solid #d4af37 !important;
            display: block !important;
            box-shadow: 0 0 8px rgba(212, 175, 55, 0.2) !important;
            padding: 0 !important;
            box-sizing: border-box !important;
        }

        .cc-auth-online-dot,
        .lumina-presence-dot {
            position: absolute !important;
            bottom: -1px !important;
            right: -1px !important;
            width: 9px !important;
            height: 9px !important;
            background: #22c55e !important;
            border-radius: 50% !important;
            border: 1.5px solid #090d1a !important;
            box-shadow: 0 0 6px #22c55e !important;
            animation: ccPulseDot 2s infinite ease-in-out !important;
            z-index: 5 !important;
        }

        @keyframes ccPulseDot {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
        }

        .cc-auth-user-name,
        .user-nav-name {
            font-size: 0.82rem !important;
            font-weight: 700 !important;
            color: #ffffff !important;
            max-width: 80px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: inline-block !important;
            line-height: 1 !important;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        .cc-auth-user-chevron,
        .user-nav-chevron {
            font-size: 0.65rem !important;
            color: #d4af37 !important;
            transition: transform 0.2s ease !important;
            display: inline-block !important;
            margin-right: 2px !important;
        }

        /* Dropdown Menu - Standard @SE26/27 Obsidian & Imperial Gold (Subtelna Poświata 3D & Klasa) */
        .cc-auth-dropdown {
            position: absolute !important;
            top: calc(100% + 8px) !important;
            right: 0 !important;
            width: 220px !important;
            background: linear-gradient(165deg, rgba(16, 16, 18, 0.98) 0%, rgba(8, 8, 10, 0.99) 100%) !important;
            border: 1px solid rgba(212, 175, 55, 0.2) !important;
            border-radius: 20px !important;
            padding: 8px !important;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.95), 0 0 25px rgba(212, 175, 55, 0.12), inset 0 1px 1px rgba(255, 235, 170, 0.18) !important;
            backdrop-filter: blur(28px) !important;
            -webkit-backdrop-filter: blur(28px) !important;
            display: none;
            flex-direction: column !important;
            gap: 4px !important;
            z-index: 10001 !important;
            transform-origin: top right !important;
            animation: ccDropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .cc-auth-dropdown.open {
            display: flex !important;
        }

        @keyframes ccDropIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .cc-auth-dropdown-item {
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 8px 12px !important;
            border-radius: 12px !important;
            color: #ffffff !important;
            text-decoration: none !important;
            font-size: 0.82rem !important;
            font-weight: 600 !important;
            transition: all 0.18s ease !important;
            cursor: pointer !important;
            border: none !important;
            background: transparent !important;
            width: 100% !important;
            text-align: left !important;
            box-sizing: border-box !important;
            font-family: inherit !important;
        }

        .cc-auth-dropdown-item:hover {
            background: rgba(212, 175, 55, 0.12) !important;
            color: #d4af37 !important;
            transform: translateX(2px) !important;
        }

        .cc-auth-dropdown-item i {
            width: 16px !important;
            font-size: 0.88rem !important;
            text-align: center !important;
            color: #d4af37 !important;
        }

        .cc-auth-dropdown-sep {
            height: 1px !important;
            background: rgba(212, 175, 55, 0.15) !important;
            margin: 4px 6px !important;
        }

        .cc-auth-dropdown-item.logout {
            color: #f87171 !important;
        }
        .cc-auth-dropdown-item.logout i {
            color: #ef4444 !important;
        }
        .cc-auth-dropdown-item.logout:hover {
            background: rgba(239, 68, 68, 0.15) !important;
            color: #fca5a5 !important;
        }

        /* Ukryj stare surowe przyciski gdy pigułka jest aktywna */
        .btn-nav-logout,
        .btn-nav-more,
        .user-nav-profile .btn-nav-logout,
        .user-nav-profile .btn-nav-more {
            display: none !important;
        }

        /* Toast powitalny */
        .cc-auth-toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, rgba(13, 22, 48, 0.97) 0%, rgba(38, 12, 54, 0.98) 100%);
            border: 1.5px solid rgba(250, 204, 21, 0.6);
            border-radius: 20px;
            padding: 14px 20px;
            color: #ffffff;
            box-shadow: 0 16px 45px rgba(0, 0, 0, 0.8), 0 0 25px rgba(250, 204, 21, 0.3);
            backdrop-filter: blur(20px);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.88rem;
            font-weight: 600;
            max-width: 360px;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }

        .cc-auth-toast.show {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        @media (max-width: 768px) {
            .cc-auth-google-btn span.cc-auth-btn-text-full {
                display: none;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: inline;
            }
            .cc-auth-toast {
                left: 16px;
                right: 16px;
                bottom: 80px;
                max-width: none;
            }
            /* TABLET / INTERMEDIATE: Zminimalizowana pigułka logowania z imieniem */
            .cc-auth-user-pill,
            .user-nav-profile.cc-auth-user-pill {
                padding: 3px 8px 3px 4px !important;
                gap: 5px !important;
                max-width: 140px !important;
                min-height: 38px !important;
                height: 38px !important;
            }
            .cc-auth-user-name,
            .user-nav-name {
                display: inline-block !important;
                font-size: 0.78rem !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                max-width: 68px !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
                white-space: nowrap !important;
                line-height: 1 !important;
            }
            .cc-auth-avatar-wrap,
            .user-nav-avatar-wrap {
                width: 28px !important;
                height: 28px !important;
                min-width: 28px !important;
                flex: 0 0 28px !important;
            }
            .cc-auth-avatar-img,
            .user-nav-avatar {
                width: 28px !important;
                height: 28px !important;
                min-width: 28px !important;
                max-width: 28px !important;
                flex: 0 0 28px !important;
            }
            .cc-auth-user-chevron,
            .user-nav-chevron {
                display: inline-block !important;
                font-size: 0.65rem !important;
            }
        }
        @media (max-width: 640px) {
            /* 📱 MOBILE PHONES: Inteligentne zwinięcie do intuicyjnych okrągłych ikon (standard @SMCC min. 44px) */
            .cc-auth-user-pill,
            .user-nav-profile.cc-auth-user-pill {
                padding: 3px !important;
                gap: 0 !important;
                width: 38px !important;
                min-width: 38px !important;
                max-width: 38px !important;
                min-height: 38px !important;
                height: 38px !important;
                aspect-ratio: 1 / 1 !important;
                border-radius: 50% !important;
                justify-content: center !important;
                align-items: center !important;
                box-sizing: border-box !important;
            }
            .cc-auth-user-name,
            .user-nav-name,
            .cc-auth-user-chevron,
            .user-nav-chevron {
                display: none !important;
            }
            .cc-auth-avatar-wrap,
            .user-nav-avatar-wrap {
                width: 30px !important;
                height: 30px !important;
                min-width: 30px !important;
                max-width: 30px !important;
                aspect-ratio: 1 / 1 !important;
                flex: 0 0 30px !important;
                margin: 0 !important;
            }
            .cc-auth-avatar-img,
            .user-nav-avatar {
                width: 30px !important;
                height: 30px !important;
                min-width: 30px !important;
                max-width: 30px !important;
                aspect-ratio: 1 / 1 !important;
                flex: 0 0 30px !important;
            }
            .cc-auth-google-btn {
                width: 38px !important;
                min-width: 38px !important;
                max-width: 38px !important;
                height: 38px !important;
                min-height: 38px !important;
                aspect-ratio: 1 / 1 !important;
                padding: 0 !important;
                border-radius: 50% !important;
                justify-content: center !important;
                align-items: center !important;
                box-sizing: border-box !important;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-full,
            .cc-auth-google-btn span.cc-auth-btn-text-short,
            .cc-auth-google-btn .cc-auth-lumina-tag {
                display: none !important;
            }
            .cc-auth-google-btn .cc-google-icon-svg {
                margin: 0 !important;
            }
        }
        @media (min-width: 769px) and (max-width: 1140px) {
            .cc-auth-google-btn {
                padding: 6px 10px 6px 8px;
                gap: 6px;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-full,
            .cc-auth-google-btn .cc-auth-lumina-tag {
                display: none !important;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: inline !important;
            }
        }
        @media (min-width: 1141px) and (max-width: 1320px) {
            .cc-auth-google-btn {
                padding: 6px 12px 6px 10px;
                gap: 6px;
            }
            .cc-auth-google-btn .cc-auth-lumina-tag {
                display: none !important;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-full {
                display: inline;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: none;
            }
        }
        @media (min-width: 1321px) {
            .cc-auth-google-btn span.cc-auth-btn-text-full {
                display: inline;
            }
            .cc-auth-google-btn span.cc-auth-btn-text-short {
                display: none;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // 2. Pomocnicze ikony Google SVG
    const GOOGLE_ICON_SVG = `
        <svg class="cc-google-icon-svg" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
    `;

    // 3. Sprawdzenie bieżącej sesji użytkownika
    function getStoredUserData() {
        // 🛡️ STRAŻNIK (2026-10-07): o zalogowaniu decyduje WYŁĄCZNIE prawdziwa sesja.
        // Wcześniej gość, który kiedykolwiek oglądał profil Założyciela (kopia w pamięci przeglądarki),
        // widział w nagłówku „Cezary Rogowski” i link „Mój profil (Cezary)”.
        try {
            const L = window.LuminaDB;
            if (L && typeof L.getCurrentUser === 'function') {
                const fbUser = L.getCurrentUser();
                if (fbUser && !fbUser.isAnonymous) {
                    const prof = (typeof L.getCurrentProfile === 'function' && L.getCurrentProfile()) || {};
                    return { user: fbUser, profile: prof };
                }
            }
            if (localStorage.getItem('lumina_user_session') !== 'active') return null;
            const userStr = localStorage.getItem('lumina_current_user');
            if (!userStr) return null;
            const user = JSON.parse(userStr);
            if (!user || !(user.uid || user.email)) return null;
            let profile = null;
            try { profile = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null'); } catch(e) {}
            if (profile && profile.uid && user.uid && profile.uid !== user.uid) profile = null; // cudzy profil w pamięci — pomijamy
            return { user, profile: profile || {} };
        } catch(e) {}
        return null;
    }

    // 4. Uniwersalne Logowanie Google
    window.ccLoginWithGoogle = async function(customRedirect = null) {
        if (!customRedirect) {
            customRedirect = window.location.pathname || window.location.href;
        }

        const btns = document.querySelectorAll('.cc-auth-google-btn');
        btns.forEach(b => {
            b.style.opacity = '0.7';
            b.style.pointerEvents = 'none';
        });

        try {
            if (!window.loginWithGoogle && !window.LuminaDB?.loginWithGoogle) {
                try {
                    const luminaModule = await import('/lumina-db.js?v=20261013_notifsafe1');
                    if (luminaModule) {
                        if (luminaModule.loginWithGoogle) window.loginWithGoogle = luminaModule.loginWithGoogle;
                        if (luminaModule.syncUserAuthProfile) window.syncUserAuthProfile = luminaModule.syncUserAuthProfile;
                        if (luminaModule.ensureDbReady) await luminaModule.ensureDbReady();
                    }
                } catch(modErr) {
                    console.warn('LuminaDB dynamic import attempt:', modErr);
                }
            }

            const loginFn = window.loginWithGoogle || window.LuminaDB?.loginWithGoogle;
            if (typeof loginFn !== 'function') {
                const target = customRedirect ? `?redirect=${encodeURIComponent(customRedirect)}` : '';
                window.location.href = `/lumina-login${target}`;
                return;
            }

            const res = await loginFn();
            if (res && res.isRedirecting) {
                return;
            }
            if (!res) {
                btns.forEach(b => {
                    b.style.opacity = '1';
                    b.style.pointerEvents = 'auto';
                });
                return;
            }

            const user = res.user;
            const profile = res.profile;
            const userName = profile?.name || user?.displayName || 'Przyjacielu';

            showAuthToast(`✨ Szczęść Boże, ${userName}! Witamy w społeczności LUMINA 🕊️`);
            renderAuthWidgets();

            if (customRedirect && customRedirect !== window.location.href && customRedirect !== window.location.pathname) {
                setTimeout(() => {
                    window.location.href = customRedirect;
                }, 800);
            }

        } catch (err) {
            console.error('CC Global Google Auth Error:', err);
            btns.forEach(b => {
                b.style.opacity = '1';
                b.style.pointerEvents = 'auto';
            });
            if (err.code === 'auth/popup-blocked') {
                alert('Twoja przeglądarka zablokowała okienko logowania Google. Zezwól na wyskakujące okienka dla tej witryny.');
            } else if (err.code !== 'auth/popup-closed-by-user') {
                alert('Nie udało się zalogować przez Google: ' + (err.message || 'Spróbuj ponownie.'));
            }
        }
    };

    // 5. Wylogowanie
    window.ccLogout = async function() {
        const logoutFn = window.logoutUser || window.LuminaDB?.logoutUser;
        if (typeof logoutFn === 'function') {
            await logoutFn();
        } else {
            localStorage.removeItem('lumina_current_user');
            localStorage.removeItem('lumina_current_user_profile');
            localStorage.removeItem('lumina_my_profile');
            localStorage.removeItem('lumina_user_session');
        }
        showAuthToast('Wylogowano pomyślnie. Niech Pan Cię błogosławi! 🕊️');
        renderAuthWidgets();
    };

    // 6. Pokazywanie toasta
    function showAuthToast(msg) {
        let toast = document.getElementById('ccAuthToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'ccAuthToast';
            toast.className = 'cc-auth-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span style="font-size:1.2rem;">✨</span><span>${msg}</span>`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4500);
    }

    // 7. Przełączanie dropdowna użytkownika (z auto-zamykaniem menu skrótów)
    window.toggleCcUserDropdown = function(event) {
        if (event) event.stopPropagation();
        const pill = event ? event.currentTarget : document.querySelector('.cc-auth-user-pill');
        const container = pill ? pill.closest('.cc-auth-widget-container, #userNavProfile, .user-nav-profile') : null;
        const drop = container ? container.querySelector('.cc-auth-dropdown') : document.getElementById('ccAuthDropdown');
        if (drop) {
            const willOpen = !drop.classList.contains('open');
            // Zamknij wszystkie inne otwarte dropdowny
            document.querySelectorAll('.cc-auth-dropdown.open').forEach(d => {
                if (d !== drop) d.classList.remove('open');
            });
            drop.classList.toggle('open');
            if (willOpen) {
                // Jeśli menu skrótów było otwarte, zamknij je dla czystości interfejsu
                const actionsList = document.getElementById('actionsList');
                const actionsToggleIcon = document.getElementById('actionsToggleIcon');
                if (actionsList && (actionsList.style.opacity === '1' || actionsList.classList.contains('open'))) {
                    actionsList.style.opacity = '0';
                    actionsList.style.transform = 'translateY(-10px)';
                    actionsList.style.pointerEvents = 'none';
                    actionsList.classList.remove('open');
                    if (actionsToggleIcon) {
                        actionsToggleIcon.classList.remove('fa-xmark');
                        actionsToggleIcon.classList.add('fa-plus');
                    }
                }
            }
        }
    };

    document.addEventListener('click', () => {
        document.querySelectorAll('.cc-auth-dropdown.open').forEach(drop => {
            drop.classList.remove('open');
        });
    });

    // 8. Renderowanie widgetu w zależności od stanu sesji
    function renderAuthWidgets() {
        const data = getStoredUserData();
        const containers = document.querySelectorAll('.cc-auth-widget-container, [data-cc-auth-mount], #userNavProfile, .user-nav-profile, #ccAuthWidgetSlot');

        containers.forEach(container => {
            if (data && data.user) {
                // ZALOGOWANY
                const user = data.user;
                const profile = data.profile || {};
                const fullName = profile.name || user.displayName || (user.email ? user.email.split('@')[0] : 'Członek LUMINA');
                const firstName = fullName.trim().split(' ')[0] || 'Profil';
                const userEmail = (user.email || '').toLowerCase();
                const userDispName = (user.displayName || profile.name || fullName || '').toLowerCase();
                // 🛡️ STRAŻNIK: konto oficjalne wyłącznie po dokładnym e-mailu (nie po imieniu ani fladze w przeglądarce)
                void userDispName;
                const isCezary = ['nazirczarkes@gmail.com','studiodees7@gmail.com','czarekrogowski3@gmail.com','osobowoscplus@gmail.com','yourimaginationstudio@gmail.com'].includes(userEmail);
                const isWioletta = userEmail.split('@')[0] === 'wioletta1240';
                const isZbyszek = profile.slug === 'zbyszekgieron';
                const isZofia = profile.slug === 'zofiadudek';
                const isMarek = userEmail === 'marusjakubowski@gmail.com' || profile.slug === 'marekjakubowski' || profile.slug === 'u_marekjakubowski';

                let avatar = profile.avatar || user.photoURL || '/lumina_icon.jpg';
                if (isCezary && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = '/avatar_cezary_official.jpg';
                else if (isWioletta && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = '/avatar_wioletta_official.jpg';
                else if (isZbyszek && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = '/avatar_zbyszek_gieron.jpg';
                else if (isZofia && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = '/avatar_zofia_dudek.jpg';
                else if (isMarek && (!profile.avatar || profile.avatar.includes('lumina_icon'))) avatar = '/avatar_marek_jakubowski.jpg';

                if (avatar && !avatar.startsWith('/') && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
                    avatar = '/' + avatar;
                }

                let profileHref = '/lumina-profile.html';
                if (isCezary) profileHref = '/lumina.cezaryrgowski.html';
                else if (isWioletta) profileHref = '/lumina.wiolettarogowska.html';
                else if (isZbyszek) profileHref = '/lumina.zbyszekgieron.html';
                else if (isZofia) profileHref = '/lumina.zofiadudek.html';
                else if (isMarek) profileHref = '/lumina.marekjakubowski.html';
                else if (profile.slug) profileHref = `/lumina-profile.html?u=${profile.slug}`;

                if (profileHref && !profileHref.startsWith('/') && !profileHref.startsWith('http')) {
                    profileHref = '/' + profileHref;
                }

                container.style.display = 'inline-flex';
                if (!container.classList.contains('cc-auth-widget-container')) {
                    container.classList.add('cc-auth-widget-container');
                }

                container.innerHTML = `
                    <div class="cc-auth-user-pill" onclick="window.toggleCcUserDropdown(event)" title="Twoje Konto LUMINA (${fullName})">
                        <div class="cc-auth-avatar-wrap">
                            <img src="${avatar}" onerror="this.onerror=null; this.src='/lumina_icon.jpg'" alt="${firstName}" class="cc-auth-avatar-img user-nav-avatar" id="userNavAvatar">
                            <span class="cc-auth-online-dot"></span>
                        </div>
                        <span class="cc-auth-user-name user-nav-name" id="userNavName">${firstName}</span>
                        <i class="fa-solid fa-chevron-down cc-auth-user-chevron"></i>
                    </div>

                    <div class="cc-auth-dropdown" onclick="event.stopPropagation()">
                        <a href="${profileHref}" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-id-card"></i>
                            <span>Mój Profil (${firstName})</span>
                        </a>
                        <a href="/tablica" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-users-viewfinder"></i>
                            <span>Tablica Społeczności</span>
                        </a>
                        <a href="/tablica?chat=open" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-comments"></i>
                            <span>Wiadomości & Czat</span>
                        </a>
                        <a href="/lumina" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-heart"></i>
                            <span>Odkrywaj Portal</span>
                        </a>
                        <a href="/biznes" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-briefcase"></i>
                            <span>Biznes Hub CC</span>
                        </a>
                        <a href="/kultura" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-landmark"></i>
                            <span>Centrum Kultury</span>
                        </a>
                        <a href="/akademia" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-graduation-cap"></i>
                            <span>Akademia Biblijna</span>
                        </a>
                        <a href="/vod" class="cc-auth-dropdown-item">
                            <i class="fa-solid fa-film"></i>
                            <span>Kino VOD</span>
                        </a>
                        <div class="cc-auth-dropdown-sep"></div>
                        <button type="button" class="cc-auth-dropdown-item logout" onclick="if(window.handleLogout) handleLogout(); else ccLogout();">
                            <i class="fa-solid fa-arrow-right-from-bracket"></i>
                            <span>Wyloguj się</span>
                        </button>
                    </div>
                `;

                // Ukryj CTA dla gościa jeśli istniało
                document.querySelectorAll('#authCtaBtn, .btn-nav-auth, #heroGuestCta').forEach(el => {
                    el.style.display = 'none';
                });
                if (document.body) {
                    document.body.classList.add('user-is-authenticated');
                    document.body.classList.remove('user-is-guest');
                }
            } else {
                // NIEZALOGOWANY
                if (container.id === 'userNavProfile' || container.classList.contains('user-nav-profile')) {
                    container.style.display = 'none';
                    container.innerHTML = '';
                    document.querySelectorAll('#authCtaBtn, .btn-nav-auth').forEach(el => {
                        el.style.display = 'inline-flex';
                    });
                    const heroGuestCta = document.getElementById('heroGuestCta');
                    if (heroGuestCta) heroGuestCta.style.display = 'flex';
                } else {
                    container.style.display = 'inline-flex';
                    container.innerHTML = `
                        <button type="button" class="cc-auth-google-btn" onclick="window.ccLoginWithGoogle()" title="Zaloguj się przez Google do społeczności LUMINA">
                            ${GOOGLE_ICON_SVG}
                            <span class="cc-auth-btn-text-full">Zaloguj z Google</span>
                            <span class="cc-auth-btn-text-short">Zaloguj</span>
                            <span class="cc-auth-lumina-tag">LUMINA</span>
                        </button>
                    `;
                }
                if (document.body) {
                    document.body.classList.remove('user-is-authenticated');
                    document.body.classList.add('user-is-guest');
                }
            }
        });
    }

    // 9. Automatyczne podpięcie do nagłówków na znanych podstronach misji
    function autoMountAuthWidget() {
        if (document.querySelector('.cc-auth-widget-container, #userNavProfile, [data-cc-auth-mount], #ccAuthWidgetSlot')) {
            renderAuthWidgets();
            return;
        }

        const headerTargets = [
            '#ccAuthWidgetSlot',
            '#quickActionsMenu',
            '.mb-header-actions',
            '.shorts-header .header-right-cluster',
            '.lumina-nav-actions',
            '.nav-right-actions',
            '.nav-right',
            '.header-right',
            '.profile-navbar > div:last-child',
            '.profile-navbar',
            '.main-nav',
            '#mainHeader .header-container',
            'header .header-container',
            'header'
        ];

        let mounted = false;
        for (const sel of headerTargets) {
            const targetEl = document.querySelector(sel);
            if (targetEl) {
                const widget = document.createElement('div');
                widget.className = 'cc-auth-widget-container';
                widget.setAttribute('data-cc-auto-mounted', 'true');
                
                if (sel === '#quickActionsMenu') {
                    targetEl.parentNode.insertBefore(widget, targetEl);
                } else if (sel === '.profile-navbar > div:last-child' || sel === '.nav-right-actions' || sel === '.header-right') {
                    targetEl.insertBefore(widget, targetEl.firstChild);
                } else {
                    targetEl.appendChild(widget);
                }
                mounted = true;
                break;
            }
        }

        renderAuthWidgets();
    }

    // 10. Reagowanie na zmiany stanu autoryzacji (LUMINA events & storage)
    window.addEventListener('lumina-auth-state', () => {
        renderAuthWidgets();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === 'lumina_current_user' || e.key === 'lumina_current_user_profile' || e.key === 'lumina_user_session') {
            renderAuthWidgets();
        }
    });

    window.addEventListener('pageshow', () => {
        renderAuthWidgets();
    });

    function hookLuminaDb() {
        if (window.LuminaDB && typeof window.LuminaDB.onAuthChange === 'function') {
            try {
                window.LuminaDB.onAuthChange(() => {
                    renderAuthWidgets();
                });
            } catch(e) {}
        }
    }
    async function initBackgroundAuthSync() {
        try {
            const luminaModule = await import('/lumina-db.js?v=20261013_notifsafe1');
            if (luminaModule) {
                if (luminaModule.loginWithGoogle) window.loginWithGoogle = luminaModule.loginWithGoogle;
                if (luminaModule.syncUserAuthProfile) window.syncUserAuthProfile = luminaModule.syncUserAuthProfile;
                if (luminaModule.ensureDbReady) {
                    const { auth } = await luminaModule.ensureDbReady();
                    if (auth && auth.currentUser) {
                        if (luminaModule.syncUserAuthProfile) {
                            await luminaModule.syncUserAuthProfile(auth.currentUser);
                        }
                        renderAuthWidgets();
                    }
                }
            }
        } catch(e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            autoMountAuthWidget();
            setTimeout(initBackgroundAuthSync, 300);
        });
    } else {
        autoMountAuthWidget();
        setTimeout(initBackgroundAuthSync, 300);
    }

    // 11. Automatyczne załadowanie modułu wsparcia misji (CC Support Footer)
    function loadSupportFooter() {
        if (window._ccSupportFooterLoaded || document.querySelector('script[src*="cc-support-footer"]')) return;
        const p = (window.location.pathname || '').toLowerCase();
        if (p.includes('-live') || p.includes('stream-scene') || p.includes('cctv24-worship') || p.includes('pilot') || p.includes('smart-tv') || p.includes('skin') || p.includes('vibe') || p.includes('radiostyle') || p.includes('mojeradio')) return;
        window._ccSupportFooterLoaded = true;
        const s = document.createElement('script');
        s.src = '/components/cc-support-footer.js?v=20261002_v1';
        s.defer = true;
        document.head.appendChild(s);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadSupportFooter);
    } else {
        loadSupportFooter();
    }

})();
