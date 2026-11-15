// ══════════════════════════════════════════════════════════════════════════
// LUMINA START PAGE PREFERENCES & SMART SESSION ROUTER
// Pozwala decydować co ma się wyświetlać na start w portalu LUMINA:
// A. Strona Główna Portalu (/lumina)
// B. Tablica Społeczności (/tablica)
// C. Własny Profil (/profil lub dedykowany profil)
// ══════════════════════════════════════════════════════════════════════════

(function() {
    'use strict';

    const STORAGE_KEY = 'lumina_start_page'; // 'home' | 'tablica' | 'profile'
    const SESSION_NAV_KEY = 'lumina_session_navigated';

    // 1. Pobranie aktualnego wyboru
    window.getLuminaStartPage = function() {
        try {
            const val = localStorage.getItem(STORAGE_KEY);
            if (val === 'tablica' || val === 'profile' || val === 'home') {
                return val;
            }
        } catch(e) {}
        return 'home'; // Domyślnie A: Strona Główna Portalu
    };

    // 2. Wyznaczenie adresu własnego profilu
    window.resolveLuminaMyProfileUrl = function() {
        let target = 'profil';
        try {
            const profile = JSON.parse(localStorage.getItem('lumina_current_user_profile') || localStorage.getItem('lumina_my_profile') || 'null');
            const user = JSON.parse(localStorage.getItem('lumina_current_user') || 'null');
            const slug = (profile && (profile.slug || profile.id)) || (user && (user.slug || user.uid || user.id)) || '';
            const email = ((user && user.email) || (profile && profile.email) || '').toLowerCase();
            const name = ((user && (user.displayName || user.name)) || (profile && profile.name) || '').toLowerCase();
            // 🛡️ STRAŻNIK (2026-10-07): „mój profil” z zalogowanego konta, nie z flag w Storage ani z imienia
            void email; void name;
            const _oid = (window.LuminaDB && typeof window.LuminaDB.detectLuminaOfficialIdentity === 'function') ? window.LuminaDB.detectLuminaOfficialIdentity(window.LuminaDB.getCurrentUser && window.LuminaDB.getCurrentUser()) : null;
            if (_oid === 'cezary') {
                target = 'lumina.cezaryrgowski.html';
            } else if (_oid === 'wioletta') {
                target = 'lumina.wiolettarogowska.html';
            } else if (slug === 'zbyszekgieron') {
                target = 'lumina.zbyszekgieron.html';
            } else if (slug === 'zofiadudek') {
                target = 'lumina.zofiadudek.html';
            } else if (slug) {
                target = 'lumina-profile.html?u=' + encodeURIComponent(slug);
            } else {
                target = 'profil';
            }
        } catch(e) {
            target = 'profil';
        }
        return target;
    };

    // 3. Zapisanie wyboru użytkownika
    window.setLuminaStartPage = function(choice, showToastMessage = true) {
        if (choice !== 'home' && choice !== 'tablica' && choice !== 'profile') {
            choice = 'home';
        }
        try {
            localStorage.setItem(STORAGE_KEY, choice);
        } catch(e) {}

        window.syncLuminaStartPageUI(choice);

        if (showToastMessage) {
            let label = 'Strona Główna Portalu';
            if (choice === 'tablica') label = 'Tablica Społeczności';
            else if (choice === 'profile') label = 'Własny Profil';

            const msg = `✓ Zapisano! Na start otwierać się będzie: ${label} ✨`;
            if (typeof window.showToast === 'function') {
                window.showToast(msg);
            } else if (typeof showToast === 'function') {
                showToast(msg);
            } else {
                console.log('[LUMINA Start Prefs]', msg);
            }
        }
    };

    // 4. Synchronizacja kontrolek UI w modalach
    window.syncLuminaStartPageUI = function(forcedChoice) {
        const choice = forcedChoice || window.getLuminaStartPage();

        // Zaznacz radio buttony
        const radios = document.querySelectorAll('input[name="luminaStartChoice"]');
        radios.forEach(r => {
            const isMatch = (r.value === choice);
            r.checked = isMatch;
            const parentLabel = r.closest('label');
            if (parentLabel) {
                if (isMatch) {
                    parentLabel.style.background = 'rgba(250, 204, 21, 0.14)';
                    parentLabel.style.borderColor = 'rgba(250, 204, 21, 0.6)';
                    parentLabel.style.boxShadow = '0 0 12px rgba(250, 204, 21, 0.2)';
                } else {
                    parentLabel.style.background = 'rgba(255, 255, 255, 0.05)';
                    parentLabel.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    parentLabel.style.boxShadow = 'none';
                }
            }
        });

        // Zaktualizuj badge tekstowy
        const badges = document.querySelectorAll('.lumina-start-page-badge, #luminaStartPageBadge');
        badges.forEach(b => {
            if (choice === 'tablica') {
                b.textContent = 'Tablica Społeczności';
                b.style.background = 'rgba(236, 72, 153, 0.22)';
                b.style.color = '#fce7f3';
            } else if (choice === 'profile') {
                b.textContent = 'Własny Profil';
                b.style.background = 'rgba(168, 85, 247, 0.22)';
                b.style.color = '#e9d5ff';
            } else {
                b.textContent = 'Strona Główna';
                b.style.background = 'rgba(250, 204, 21, 0.22)';
                b.style.color = '#fef08a';
            }
        });
    };

    // 5. Smart Routing przy uruchomieniu portalu (np. wejście na /lumina lub start PWA)
    window.executeLuminaStartRouting = function() {
        // Dotyczy wyłącznie strony głównej (/lumina lub /lumina.html)
        const path = window.location.pathname.toLowerCase();
        const isHomePage = path === '/lumina' || path === '/lumina.html' || path === '/' || path.endsWith('/lumina.html');
        if (!isHomePage) return;

        const urlParams = new URLSearchParams(window.location.search);
        // Jeśli użytkownik ma wyraźny parametr nawigacyjny, nie przekierowuj
        if (urlParams.has('direct') || urlParams.has('stay') || urlParams.has('nav') || urlParams.has('auth') || urlParams.has('q') || urlParams.has('admin')) {
            try { sessionStorage.setItem(SESSION_NAV_KEY, '1'); } catch(e) {}
            return;
        }

        const isPwaLaunch = urlParams.has('source') && urlParams.get('source').includes('pwa');
        let isFreshSession = false;
        try {
            isFreshSession = !sessionStorage.getItem(SESSION_NAV_KEY);
        } catch(e) {}

        // Oznacz sesję jako aktywną
        try { sessionStorage.setItem(SESSION_NAV_KEY, '1'); } catch(e) {}

        // Jeśli to start sesji lub uruchomienie z PWA, sprawdź preferencję użytkownika
        if (isPwaLaunch || isFreshSession) {
            const startChoice = window.getLuminaStartPage();
            if (startChoice === 'tablica') {
                const target = 'tablica' + (isPwaLaunch ? '?source=pwa' : '');
                window.location.replace(target);
            } else if (startChoice === 'profile') {
                const profileUrl = window.resolveLuminaMyProfileUrl();
                const separator = profileUrl.includes('?') ? '&' : '?';
                const target = profileUrl + (isPwaLaunch ? separator + 'source=pwa' : '');
                window.location.replace(target);
            }
        }
    };

    // 6. Inicjalizacja
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.syncLuminaStartPageUI();
        });
    } else {
        window.syncLuminaStartPageUI();
    }
})();
