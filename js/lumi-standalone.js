(function () {
    'use strict';
    // LUMI Messenger is a dedicated cinematic dark shell; enforce dark theme on load
    try {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-lumina-theme', 'dark');
            if (document.body) {
                document.body.classList.remove('theme-lumina-light');
            }
        }
    } catch (_) {}
    let installPrompt = null;
    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault(); installPrompt = event;
        const btn = document.getElementById('lumiInstall');
        if (btn) btn.textContent = 'Zainstaluj LUMI Messenger';
    });
    function setup() {
        const open = document.getElementById('lumiOpen');
        const install = document.getElementById('lumiInstall');
        const status = document.getElementById('lumiInstallStatus');
        if (!open || !install || !status) return;
        const installed = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        function updateAccount() {
            const user = window.LuminaDB?.getCurrentUser?.();
            const member = Boolean(user && !user.isAnonymous);
            const login = document.getElementById('lumiLogin');
            const settings = document.getElementById('lumiSettings');
            if (login) login.hidden = member;
            if (settings) settings.hidden = !member;
            if (document.getElementById('lumiLanding')?.classList.contains('lumi-dashboard')) {
                const label = open.querySelector('span');
                if (label) label.textContent = 'Czat ogólny';
            } else open.textContent = member ? 'Otwórz moje rozmowy' : 'Otwórz komunikator';
        }
        function updateInstalled() {
            if (installed()) { install.hidden = true; status.textContent = 'LUMI uruchomione jako aplikacja.'; }
        }
        function openChat() {
            if (typeof window.openDirectMessagesModal === 'function') {
                window.CCGlobalChat?.close?.();
                window.openDirectMessagesModal('public');
                document.getElementById('tabBtnPublicChat')?.focus({ preventScroll: true });
                return;
            }
            status.textContent = 'Komunikator jeszcze się ładuje. Spróbuj ponownie za chwilę.';
        }
        open.addEventListener('click', openChat);
        open.disabled = false;
        document.addEventListener('click', event => {
            if (!event.target.closest?.('#ccChatFabBtn')) return;
            event.preventDefault();
            event.stopPropagation();
            openChat();
        }, true);
        const settings = document.getElementById('lumiSettings');
        if (settings) {
            settings.addEventListener('click', () => {
                if (typeof window.openChatSettingsModal === 'function') {
                    window.openChatSettingsModal();
                } else if (typeof window.openDirectMessagesModal === 'function') {
                    window.openDirectMessagesModal('private');
                }
            });
        }
        install.addEventListener('click', async () => {
            if (!installPrompt) {
                const help = document.getElementById('lumiInstallHelp');
                if (help) { help.open = true; help.scrollIntoView?.({block:'nearest'}); }
                return;
            }
            const prompt = installPrompt; installPrompt = null; install.disabled = true;
            try {
                await prompt.prompt();
                const choice = await prompt.userChoice;
                status.textContent = choice.outcome === 'accepted' ? 'Przeglądarka przyjęła instalację LUMI.' : 'Instalacja anulowana. Możesz nadal korzystać z przeglądarki.';
            } catch { status.textContent = 'Skorzystaj z instalacji w menu przeglądarki.'; }
            finally { install.disabled = false; install.textContent = 'Dodaj LUMI do urządzenia'; }
        });
        window.addEventListener('appinstalled', () => {
            installPrompt = null; install.hidden = true; status.textContent = 'LUMI Messenger zostało zainstalowane.';
        });
        // Reuse the existing push worker; no new scope, cache purge or push consent.
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js?v=4.1.6_20260914_fullsync', {scope:'/', updateViaCache:'none'}).catch(() => {
                status.textContent = 'Nie udało się przygotować aplikacji. Komunikator pozostaje dostępny w przeglądarce.';
            });
        }
        updateInstalled();
        updateAccount();
        window.addEventListener('lumina-auth-state', updateAccount);
        setupIntro();
        const viewport = window.visualViewport;
        const syncViewport = () => {
            if (!viewport || Math.abs(viewport.scale - 1) > 0.02) return;
            document.documentElement.style.setProperty('--lumi-viewport-height', `${viewport.height}px`);
            document.documentElement.classList.toggle('lumi-compact-viewport', viewport.height < 500);
            document.documentElement.style.setProperty('--lumi-viewport-top', `${viewport.offsetTop}px`);
        };
        viewport?.addEventListener('resize', syncViewport, { passive: true });
        viewport?.addEventListener('scroll', syncViewport, { passive: true });
        window.addEventListener('resize', () => window.requestAnimationFrame(syncViewport), { passive: true });
        syncViewport();
        if (new URLSearchParams(location.search).get('room') === 'public') openChat();
    }
    function setupIntro() {
        const overlay = document.getElementById('lumiIntroOverlay');
        const video = document.getElementById('lumiIntroVideo');
        const skipBtn = document.getElementById('lumiIntroSkip');
        const soundBtn = document.getElementById('lumiIntroSound');
        const soundIcon = document.getElementById('lumiIntroSoundIcon');
        const soundText = document.getElementById('lumiIntroSoundText');
        const progressBar = document.getElementById('lumiIntroProgressBar');
        const replayBtn = document.getElementById('lumiReplayIntro');
        if (!overlay || !video) return;
        if (new URLSearchParams(window.location.search).get('embed') === '1') {
            overlay.hidden = true;
            try { video.pause(); } catch (_) {}
            return;
        }

        let isDismissed = false;

        function updateSoundUI(muted) {
            if (soundIcon) soundIcon.textContent = muted ? '🔇' : '🔊';
            if (soundText) soundText.textContent = muted ? 'Włącz dźwięk' : 'Wycisz';
            if (soundBtn) soundBtn.setAttribute('aria-label', muted ? 'Włącz dźwięk' : 'Wycisz');
        }

        function dismissIntro() {
            if (isDismissed) return;
            isDismissed = true;
            overlay.classList.add('fade-out');
            try { video.pause(); } catch (_) {}
            setTimeout(() => {
                overlay.hidden = true;
            }, 750);
        }

        function isPortraitMobile() {
            try {
                return window.matchMedia && window.matchMedia('(orientation: portrait) and (max-width: 900px)').matches;
            } catch (_) {
                return false;
            }
        }

        function resolveIntroSources() {
            const isMobile = isPortraitMobile();
            const targetSrc = isMobile ? '/images/chat/lumi-intro-mobile.mp4' : '/images/chat/lumi-intro.mp4';
            const targetPoster = isMobile ? '/images/chat/lumi-intro-mobile-poster.webp' : '/images/chat/lumi-intro-poster.webp';
            if (video.getAttribute('poster') !== targetPoster) video.setAttribute('poster', targetPoster);
            const current = video.currentSrc || video.src || '';
            if (!current.includes(targetSrc)) {
                video.src = targetSrc;
                try { video.load(); } catch (_) {}
            }
        }

        function playIntro(withAudio) {
            isDismissed = false;
            overlay.hidden = false;
            overlay.classList.remove('fade-out');
            if (progressBar) progressBar.style.width = '0%';
            resolveIntroSources();
            try { video.currentTime = 0; } catch (_) {}
            video.muted = !withAudio;
            updateSoundUI(video.muted);
            const promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(() => {
                    video.muted = true;
                    updateSoundUI(true);
                    video.play().catch(() => {});
                });
            }
        }

        if (skipBtn) {
            skipBtn.addEventListener('click', e => {
                e.stopPropagation();
                dismissIntro();
            });
        }

        if (soundBtn) {
            soundBtn.addEventListener('click', e => {
                e.stopPropagation();
                video.muted = !video.muted;
                updateSoundUI(video.muted);
            });
        }

        video.addEventListener('timeupdate', () => {
            if (progressBar && video.duration) {
                const pct = Math.min(100, (video.currentTime / video.duration) * 100);
                progressBar.style.width = pct + '%';
            }
        });

        video.addEventListener('ended', () => {
            if (progressBar) progressBar.style.width = '100%';
            dismissIntro();
        });

        overlay.addEventListener('click', e => {
            if (e.target === overlay || e.target.classList.contains('lumi-intro-video-wrap')) {
                dismissIntro();
            }
        });

        document.addEventListener('keydown', e => {
            if (!overlay.hidden && !isDismissed && (e.key === 'Escape' || e.key === ' ')) {
                dismissIntro();
            }
        });

        function hasSeenIntroToday() {
            try {
                return /(?:^|;\s*)lumi_intro_seen=1/.test(document.cookie);
            } catch (_) {
                return false;
            }
        }

        function markIntroSeenToday() {
            try {
                const now = new Date();
                const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
                const maxAge = Math.max(300, Math.floor((midnight.getTime() - now.getTime()) / 1000));
                document.cookie = `lumi_intro_seen=1; path=/; max-age=${maxAge}; SameSite=Lax`;
            } catch (_) {}
        }

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                markIntroSeenToday();
                playIntro(true);
            });
        }

        const forceIntro = window.location.search.includes('intro=1') || window.location.hash === '#intro';
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion || (!forceIntro && (hasSeenIntroToday() || document.getElementById('lumiLanding')?.classList.contains('lumi-dashboard')))) {
            overlay.hidden = true;
            overlay.classList.add('fade-out');
        } else {
            markIntroSeenToday();
            playIntro(false);
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
})();
