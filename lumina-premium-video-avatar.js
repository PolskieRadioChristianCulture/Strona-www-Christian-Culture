/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA PREMIUM VIDEO AVATAR ENGINE (lumina-premium-video-avatar.js)
 * 10-sekundowe wideo profilowe dla Profili Specjalnych i Patronów Misji CC
 * Ekosystem: Christian Culture | LUMINA Portal Społeczności Chrześcijańskiej
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(window, document) {
    'use strict';

    // Domyślne i polecane pętle wideo 10s dla profili specjalnych i patronów
    const PRESET_VIDEOS = [
        {
            id: 'preset_cezary_official',
            title: 'Cezary Rogowski • Oficjalne Wideo',
            badge: 'Założyciel CC',
            url: 'wideo_profilowe_cezary_rogowski.mp4?v=20261123',
            desc: 'Oficjalne wideo profilowe z charakterystycznym uśmiechem i logo Christian Culture'
        },
        {
            id: 'preset_wioletta_official',
            title: 'Wioletta Rogowska • Oficjalne Wideo',
            badge: 'Współzałożycielka CC',
            url: 'wioletta_profile_video.mp4?v=20261123',
            desc: 'Oficjalne wideo profilowe Współzałożycielki Christian Culture'
        },
        {
            id: 'preset_ccwomen_official',
            title: 'CC Women • Służba Kobiet CC',
            badge: 'Oficjalne CC Women',
            url: 'wideo_profilowe_ccwomen.mp4?v=20261123',
            desc: 'Oficjalne wideo profilowe społeczności Christian Culture Women'
        },
        {
            id: 'preset_cc_store',
            title: 'Christian Culture • Oficjalne Wideo CC',
            badge: 'Polecane CC',
            url: 'avatar_video_sklep_karuzela.mp4?v=20261123',
            desc: 'Dynamiczna pętla misyjna Christian Culture'
        },
        {
            id: 'preset_sds_official',
            title: 'Studio Dobrego Słowa • Apokalipsa Live',
            badge: 'Studio DeeS',
            url: 'https://www.youtube.com/watch?v=hHug_C6XDPU',
            desc: 'Oficjalna transmisja wideo Studio Dobrego Słowa (@StudioDeeS)'
        },
        {
            id: 'preset_light_welcome',
            title: 'Cześć! Dobrze, że jesteś ✨',
            badge: 'Powitanie',
            url: 'czesc_dobrze_ze_jestes.mp4?v=20261123',
            desc: 'Ciepłe, osobiste powitanie chrześcijańskie'
        },
        {
            id: 'preset_shop_faith',
            title: 'Misja & Sklep CC • Dobre Dzieła',
            badge: 'Wsparcie Misji',
            url: 'avatar_video_sklep_cc2.mp4?v=20261123',
            desc: 'Wideo prezentujące dzieła wspierające ewangelizację'
        }
    ];

    // Domyślne przypisania wideo dla profili specjalnych (jeśli użytkownik jeszcze nie wgrał własnego)
    const SPECIAL_PROFILES_DEFAULT_VIDEOS = {
        'cezaryrgowski': 'wideo_profilowe_cezary_rogowski.mp4?v=20261123',
        'studiodobregoslowa': 'czesc_dobrze_ze_jestes.mp4?v=20261123',
        'cctv': 'avatar_video_sklep_cc2.mp4?v=20261123',
        'radiocc': 'avatar_video_sklep_karuzela.mp4?v=20261123',
        'ccmen': 'avatar_video_sklep_karuzela.mp4?v=20261123',
        'ccwomen': 'wideo_profilowe_ccwomen.mp4?v=20261123',
        'osobowoscplus': 'czesc_dobrze_ze_jestes.mp4?v=20261123',
        'wiolettarogowska': 'wioletta_profile_video.mp4?v=20261123',
        'u_bibliaaudiochristianculture_3248': 'avatar_biblia_audio.gif',
        'bibliaaudio': 'avatar_biblia_audio.gif'
    };

    class LuminaPremiumVideoAvatarEngine {
        constructor() {
            this.maxDurationSeconds = 10.0;
            this.currentSlug = this.detectCurrentSlug();
            this.activeVideoUrl = null;
            this.previewVideoUrl = null;
            this.autoMountTimer = null;
            this.init();
        }

        getYouTubeId(url) {
            if (!url) return null;
            const str = String(url).trim();
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/;
            const match = str.match(regExp);
            if (match && match[2] && match[2].length === 11) {
                return match[2];
            }
            if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
                return str;
            }
            return null;
        }

        getEmbedUrl(url) {
            const ytId = this.getYouTubeId(url);
            if (ytId) {
                return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&playsinline=1&enablejsapi=1&rel=0&modestbranding=1`;
            }
            return url;
        }

        detectCurrentSlug() {
            try {
                // 0. Ze zdefiniowanej na stronie zmiennej globalnej window._currentProfileSlug
                if (window._currentProfileSlug) {
                    return window._currentProfileSlug.toLowerCase().trim();
                }

                // 1. Z funkcji getRequestedUserSlug (jeśli dostępna na stronie)
                if (typeof window.getRequestedUserSlug === 'function') {
                    const reqSlug = window.getRequestedUserSlug();
                    if (reqSlug) return reqSlug.toLowerCase().trim();
                }

                // 2. Parametry URL ?u= lub ?user= lub ?slug=
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('u')) return urlParams.get('u').toLowerCase().trim();
                if (urlParams.get('user')) return urlParams.get('user').toLowerCase().trim();
                if (urlParams.get('slug')) return urlParams.get('slug').toLowerCase().trim();

                // 3. Ścieżka URL
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
                if (path.includes('cezaryrgowski') || path.includes('cezaryrogowski')) return 'cezaryrgowski';

                // 4. Globalne obiekty profilu
                if (window._cloudProfileData && window._cloudProfileData.slug) {
                    return window._cloudProfileData.slug.toLowerCase().trim();
                }
                const curRaw = localStorage.getItem('lumina_current_user_profile');
                if (curRaw) {
                    const cur = JSON.parse(curRaw);
                    if (cur && cur.slug) return cur.slug.toLowerCase().trim();
                }
            } catch(e) {
                console.warn('[LUMINA][VideoAvatar] Nie udało się wykryć profilu:', e);
            }
            return null;
        }

        init() {
            this.injectStyles();
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            this.currentSlug = this.detectCurrentSlug();
            this.renderModal();
            this.mountVideoAvatars();
            this.injectVideoTriggerButtons();
            this.startAutoMountEngine();
            this.wrapProfileRenderFunctions();
        }

        wrapProfileRenderFunctions() {
            // Przechwyć renderProfile / renderProfileView, aby po zmianie widoku natychmiast zamontować wideo
            const self = this;
            ['renderProfile', 'renderProfileView'].forEach(fnName => {
                if (typeof window[fnName] === 'function' && !window[fnName]._wrappedForVideoAvatar) {
                    const orig = window[fnName];
                    window[fnName] = function(...args) {
                        const res = orig.apply(this, args);
                        setTimeout(() => self.mountVideoAvatars(), 50);
                        return res;
                    };
                    window[fnName]._wrappedForVideoAvatar = true;
                }
            });
        }

        startAutoMountEngine() {
            if (this._observer) {
                try { this._observer.disconnect(); } catch(e) {}
            }

            let debounceTimer = null;
            const triggerMount = () => {
                if (debounceTimer) clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.mountVideoAvatars();
                    this.injectVideoTriggerButtons();
                }, 120);
            };

            this._observer = new MutationObserver((mutations) => {
                for (let i = 0; i < mutations.length; i++) {
                    if (mutations[i].addedNodes && mutations[i].addedNodes.length > 0) {
                        triggerMount();
                        break;
                    }
                }
            });

            if (document.body) {
                this._observer.observe(document.body, { childList: true, subtree: true });
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    if (document.body) {
                        this._observer.observe(document.body, { childList: true, subtree: true });
                    }
                });
            }

                        triggerMount();

            const resumeAllVideos = () => {
                document.querySelectorAll('video.avatar-video-element').forEach(v => {
                    if (v.paused) v.play().catch(() => {});
                });
            };
            document.addEventListener('touchstart', resumeAllVideos, { passive: true, once: true });
            document.addEventListener('click', resumeAllVideos, { passive: true, once: true });
        }

        injectStyles() {
            if (document.getElementById('luminaVideoAvatarStyles')) return;
            const style = document.createElement('style');
            style.id = 'luminaVideoAvatarStyles';
            style.textContent = `
                /* ══════════ PREMIUM VIDEO AVATAR STYLES ══════════ */
                .avatar-wrap, .head-avatar-wrapper, .author-avatar-wrap {
                    position: relative;
                    overflow: visible;
                }

                .avatar-video-element {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    z-index: 3;
                    pointer-events: none;
                    background: transparent;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.3);
                }

                .avatar-wrap.has-premium-video {
                    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.7), 0 0 25px rgba(245, 158, 11, 0.45);
                    animation: pulseVideoHalo 3s ease-in-out infinite alternate;
                }

                @keyframes pulseVideoHalo {
                    0% { box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.7), 0 0 20px rgba(245, 158, 11, 0.3); }
                    100% { box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.85), 0 0 32px rgba(236, 72, 153, 0.55); }
                }

                .btn-video-avatar-badge {
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 25;
                    background: linear-gradient(135deg, #f59e0b, #ec4899);
                    color: #fff;
                    border: 1.5px solid rgba(15, 23, 42, 0.95);
                    border-radius: 20px;
                    padding: 3px 9px;
                    font-size: 0.68rem;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(0,0,0,0.7), 0 0 14px rgba(245,158,11,0.5);
                    white-space: nowrap;
                    text-decoration: none;
                    opacity: 0.95;
                    visibility: visible;
                    pointer-events: auto;
                    transition: transform 0.2s ease, opacity 0.2s ease;
                }

                .btn-video-avatar-badge:hover {
                    transform: translateX(-50%) scale(1.08);
                    box-shadow: 0 6px 18px rgba(0,0,0,0.85), 0 0 18px rgba(236,72,153,0.8);
                }

                .avatar-edit-overlay-menu {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(to top, rgba(0,0,0,0.85), transparent);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 4px;
                    border-bottom-left-radius: 50%;
                    border-bottom-right-radius: 50%;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    z-index: 8;
                }

                .avatar-wrap:hover .avatar-edit-overlay-menu {
                    opacity: 1;
                }

                .avatar-mini-action-btn {
                    background: rgba(255,255,255,0.2);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.4);
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .avatar-mini-action-btn:hover {
                    background: #f59e0b;
                    color: #000;
                    transform: scale(1.15);
                }

                /* Modal Video Avatar */
                .lumina-video-avatar-modal {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    background: rgba(4, 8, 20, 0.88);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
                }

                .lumina-video-avatar-modal.active {
                    display: flex;
                }

                .lumina-video-avatar-card {
                    background: linear-gradient(145deg, #0b1329, #111e40);
                    border: 1.5px solid rgba(245, 158, 11, 0.4);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(245, 158, 11, 0.25);
                    border-radius: 24px;
                    width: 100%;
                    max-width: 680px;
                    max-height: 90vh;
                    overflow-y: auto;
                    color: #fff;
                    padding: 24px;
                    position: relative;
                }

                .lumina-video-avatar-card::-webkit-scrollbar {
                    width: 6px;
                }
                .lumina-video-avatar-card::-webkit-scrollbar-thumb {
                    background: rgba(245,158,11,0.4);
                    border-radius: 4px;
                }

                .preview-video-container {
                    width: 140px;
                    height: 140px;
                    margin: 0 auto 16px;
                    border-radius: 50%;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.8), 0 0 25px rgba(245, 158, 11, 0.4);
                    background: #000;
                }

                .preview-video-container video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .preset-video-item {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 14px;
                    padding: 10px 12px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .preset-video-item:hover {
                    background: rgba(245, 158, 11, 0.12);
                    border-color: rgba(245, 158, 11, 0.4);
                    transform: translateY(-2px);
                }

                .preset-video-item.active {
                    background: rgba(245, 158, 11, 0.2);
                    border-color: #f59e0b;
                }
            `;
            document.head.appendChild(style);
        }

        getVideoForSlug(slug) {
            if (!slug) slug = this.detectCurrentSlug();
            this.currentSlug = slug;

            // 1. Zapisany bezpośrednio w localStorage pod kluczem 'lumina_avatar_video_SLUG'
            const saved = localStorage.getItem('lumina_avatar_video_' + slug);
            if (saved) return saved;

            // 2. W obiekcie profilu w localStorage ('lumina_profile_SLUG')
            try {
                const p = JSON.parse(localStorage.getItem('lumina_profile_' + slug) || '{}');
                if (p && p.avatarVideo) return p.avatarVideo;
            } catch(e) {}

            // 3. W obiekcie bieżącego użytkownika ('lumina_current_user_profile')
            try {
                const cur = JSON.parse(localStorage.getItem('lumina_current_user_profile') || '{}');
                if (cur && (cur.slug === slug || cur.uid === slug) && cur.avatarVideo) {
                    return cur.avatarVideo;
                }
            } catch(e) {}

            // 4. W danych z chmury window._cloudProfileData
            if (window._cloudProfileData && (window._cloudProfileData.slug === slug || window._cloudProfileData.uid === slug)) {
                if (window._cloudProfileData.avatarVideo) {
                    return window._cloudProfileData.avatarVideo;
                }
            }

            // 5. Domyślny dla profili specjalnych
            if (SPECIAL_PROFILES_DEFAULT_VIDEOS[slug]) {
                return SPECIAL_PROFILES_DEFAULT_VIDEOS[slug];
            }

            return null;
        }

        saveVideoForSlug(slug, videoUrl) {
            if (!slug) slug = this.detectCurrentSlug();
            this.currentSlug = slug;

            if (videoUrl) {
                // Zapisz w kluczu bezpośrednim
                localStorage.setItem('lumina_avatar_video_' + slug, videoUrl);

                // Zapisz w obiekcie profilu
                try {
                    let p = {};
                    const pRaw = localStorage.getItem('lumina_profile_' + slug);
                    if (pRaw) {
                        p = JSON.parse(pRaw);
                    } else if (window._cloudProfileData && window._cloudProfileData.slug === slug) {
                        p = { ...window._cloudProfileData };
                    }
                    p.slug = slug;
                    p.avatarVideo = videoUrl;

                    localStorage.setItem('lumina_profile_' + slug, JSON.stringify(p));

                    // Jeśli dotyczy obecnego użytkownika, zaktualizuj też profil sesyjny
                    const curRaw = localStorage.getItem('lumina_current_user_profile');
                    if (curRaw) {
                        try {
                            const cur = JSON.parse(curRaw);
                            if (cur.slug === slug || cur.uid === slug) {
                                cur.avatarVideo = videoUrl;
                                localStorage.setItem('lumina_current_user_profile', JSON.stringify(cur));
                            }
                        } catch(e) {}
                    }

                    if (window._cloudProfileData) {
                        window._cloudProfileData.avatarVideo = videoUrl;
                    }

                    // Zapis do chmury Firestore
                    if (window.LuminaDB && typeof window.LuminaDB.saveProfileToCloud === 'function') {
                        window.LuminaDB.saveProfileToCloud(slug, p);
                    }
                } catch(e) {}
            } else {
                localStorage.removeItem('lumina_avatar_video_' + slug);
                try {
                    const pRaw = localStorage.getItem('lumina_profile_' + slug);
                    if (pRaw) {
                        const p = JSON.parse(pRaw);
                        delete p.avatarVideo;
                        localStorage.setItem('lumina_profile_' + slug, JSON.stringify(p));
                        if (window.LuminaDB && typeof window.LuminaDB.saveProfileToCloud === 'function') {
                            window.LuminaDB.saveProfileToCloud(slug, p);
                        }
                    }
                    if (window._cloudProfileData) {
                        delete window._cloudProfileData.avatarVideo;
                    }
                } catch(e) {}
            }

            this.mountVideoAvatars(slug);
        }

        mountVideoAvatars(targetSlug) {
            const slug = targetSlug || this.detectCurrentSlug();
            this.currentSlug = slug;
            const videoUrl = this.getVideoForSlug(slug);
            const avatarWraps = document.querySelectorAll('.avatar-wrap, .head-avatar-wrapper, .profile-avatar-wrap');

            avatarWraps.forEach(wrap => {
                let videoEl = wrap.querySelector('video.avatar-video-element');
                let iframeEl = wrap.querySelector('iframe.avatar-video-element');

                if (videoUrl) {
                    const isGif = videoUrl.endsWith('.gif') || videoUrl.includes('image/gif') || videoUrl.includes('.gif?');
                    if (isGif) {
                        wrap.classList.remove('has-premium-video');
                        if (videoEl) videoEl.remove();
                        if (iframeEl) iframeEl.remove();
                        const targetImg = wrap.querySelector('img.avatar-img, img.profile-avatar-img, img#avatarImgEl');
                        if (targetImg && targetImg.src !== videoUrl) {
                            targetImg.src = videoUrl;
                        }
                        return;
                    }

                    wrap.classList.add('has-premium-video');
                    const ytId = this.getYouTubeId(videoUrl);

                    if (ytId) {
                        // YouTube Embed
                        if (videoEl) videoEl.remove();
                        if (!iframeEl) {
                            iframeEl = document.createElement('iframe');
                            iframeEl.className = 'avatar-video-element avatar-iframe-element';
                            iframeEl.setAttribute('allow', 'autoplay; encrypted-media');
                            iframeEl.setAttribute('frameborder', '0');
                            iframeEl.setAttribute('allowfullscreen', 'true');
                            iframeEl.style.width = '100%';
                            iframeEl.style.height = '100%';
                            iframeEl.style.borderRadius = '50%';
                            iframeEl.style.border = 'none';
                            iframeEl.style.pointerEvents = 'none';
                            iframeEl.style.objectFit = 'cover';
                            wrap.appendChild(iframeEl);
                        }

                        const embedSrc = this.getEmbedUrl(videoUrl);
                        if (iframeEl.getAttribute('data-src') !== embedSrc) {
                            iframeEl.setAttribute('data-src', embedSrc);
                            iframeEl.src = embedSrc;
                        }
                    } else {
                        // Bezpośredni plik wideo (MP4, DataURL base64, WebM)
                        if (iframeEl) iframeEl.remove();
                        if (!videoEl) {
                            videoEl = document.createElement('video');
                            videoEl.className = 'avatar-video-element';
                            videoEl.autoplay = true;
                            videoEl.loop = true;
                            videoEl.muted = true;
                            videoEl.defaultMuted = true;
                            videoEl.playsInline = true;
                            videoEl.setAttribute('autoplay', '');
                            videoEl.setAttribute('loop', '');
                            videoEl.setAttribute('muted', '');
                            videoEl.setAttribute('playsinline', '');
                            videoEl.setAttribute('webkit-playsinline', '');
                            videoEl.setAttribute('disablepictureinpicture', '');
                            wrap.appendChild(videoEl);
                        }

                        videoEl.onerror = () => {
                            console.warn('[LUMINA][VideoAvatar] Błąd odtwarzania wideo:', videoUrl);
                            if (videoUrl && videoUrl.startsWith('data:')) {
                                try {
                                    localStorage.removeItem('lumina_avatar_video_' + slug);
                                } catch(e) {}
                                const fallbackUrl = SPECIAL_PROFILES_DEFAULT_VIDEOS[slug] || 'wideo_profilowe_ccwomen.mp4';
                                if (videoEl.getAttribute('data-src') !== fallbackUrl) {
                                    videoEl.setAttribute('data-src', fallbackUrl);
                                    videoEl.src = fallbackUrl;
                                    videoEl.load();
                                    videoEl.play().catch(() => {});
                                }
                            }
                        };

                        const lazyApi = window.ccLazyVideo;
                        if (lazyApi && !videoEl.getAttribute('src') && videoEl.getAttribute('data-src') !== videoUrl) {
                            // @007 23.11.2026: pobieraj dopiero, gdy awatar jest blisko ekranu (js/cc-lazy-video.js)
                            videoEl.setAttribute('data-src', videoUrl);
                            videoEl.setAttribute('preload', 'none');
                            videoEl.setAttribute('data-lazy-src', videoUrl);
                            lazyApi.observe(videoEl);
                        } else if (videoEl.getAttribute('data-src') !== videoUrl) {
                            videoEl.setAttribute('data-src', videoUrl);
                            videoEl.src = videoUrl;
                            videoEl.load();
                            const p = videoEl.play();
                            if (p !== undefined) {
                                p.catch(() => {});
                            }
                        }

                        videoEl.ontimeupdate = () => {
                            if (videoEl.currentTime >= this.maxDurationSeconds) {
                                videoEl.currentTime = 0;
                                videoEl.play().catch(() => {});
                            }
                        };
                    }
                } else {
                    wrap.classList.remove('has-premium-video');
                    if (videoEl) videoEl.remove();
                    if (iframeEl) iframeEl.remove();
                }
            });
        }

        injectVideoTriggerButtons() {
            const currentSlug = this.detectCurrentSlug();
            const hasVideo = !!this.getVideoForSlug(currentSlug);
            const avatarWraps = document.querySelectorAll('.avatar-wrap, .head-avatar-wrapper, .profile-avatar-wrap');
            avatarWraps.forEach(wrap => {
                let badge = wrap._profileVideoBadge || wrap.querySelector('.btn-video-avatar-badge');
                if (!hasVideo) {
                    if (badge) badge.remove();
                    wrap._profileVideoBadge = null;
                    return;
                }
                if (!badge) {
                    badge = document.createElement('button');
                    badge.type = 'button';
                    badge.className = 'btn-video-avatar-badge';
                    badge.title = '10s Wideo Profilowe • Opcja Premium / Patron CC';
                    badge.innerHTML = '<i class="fa-solid fa-play"></i> 10s Wideo';
                    badge.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openModal(this.currentSlug);
                    };
                    wrap._profileVideoBadge = badge;
                    wrap.appendChild(badge);
                }

                // Podepnij kliknięcie w awatar, aby pokazywać napis "10s Wideo" na życzenie
                if (!wrap._videoBadgeClickBound) {
                    wrap._videoBadgeClickBound = true;

                    wrap.addEventListener('click', (e) => {
                        if (!wrap.contains(badge)) return; // Action now lives in the profile More panel.
                        // Jeśli kliknięto w samą plakietkę, obsługa jest w badge.onclick
                        if (e.target.closest('.btn-video-avatar-badge')) return;

                        // Zachowaj ewentualne bezpośrednie kliknięcia w inne dedykowane nakładki
                        const isEditBtn = e.target.closest('.avatar-edit-overlay') || e.target.closest('.avatar-edit-btn');

                        const wasVisible = badge.classList.contains('is-visible');

                        // Ukryj na innych awatarach
                        document.querySelectorAll('.btn-video-avatar-badge.is-visible').forEach(b => b.classList.remove('is-visible'));

                        if (!wasVisible) {
                            badge.classList.add('is-visible');
                        } else if (!isEditBtn) {
                            // Ponowne kliknięcie w awatar gdy napis jest już widoczny -> otwiera konfiguracyjne okno 10s wideo
                            this.openModal(this.currentSlug);
                        }
                    });
                }
            });

            // Kliknięcie gdziekolwiek poza awatarem ukrywa napis "10s Wideo"
            if (!window._videoBadgeGlobalDismissBound) {
                window._videoBadgeGlobalDismissBound = true;
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.avatar-wrap') && !e.target.closest('.head-avatar-wrapper') && !e.target.closest('.profile-avatar-wrap')) {
                        document.querySelectorAll('.btn-video-avatar-badge.is-visible').forEach(b => b.classList.remove('is-visible'));
                    }
                });
            }
        }

        renderModal() {
            if (document.getElementById('luminaVideoAvatarModal')) return;

            const modal = document.createElement('div');
            modal.id = 'luminaVideoAvatarModal';
            modal.className = 'lumina-video-avatar-modal';
            modal.onclick = (e) => {
                if (e.target === modal) this.closeModal();
            };

            modal.innerHTML = `
                <div class="lumina-video-avatar-card" onclick="event.stopPropagation()">
                    <button type="button" onclick="window.LuminaPremiumAvatar.closeModal()" style="position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.08); border:none; color:#94a3b8; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.1rem; transition:all 0.2s ease;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>

                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                        <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #f59e0b, #ec4899); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.2rem; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                            <i class="fa-solid fa-video"></i>
                        </div>
                        <div>
                            <h3 style="font-family:'Outfit',sans-serif; font-size:1.25rem; font-weight:800; margin:0; color:#fff;">
                                Wideo Profilowe <span style="font-size:0.75rem; background:linear-gradient(135deg,#f59e0b,#ec4899); color:#fff; padding:2px 8px; border-radius:12px; font-weight:800; vertical-align:middle;">PREMIUM ✨</span>
                            </h3>
                            <div style="font-size:0.78rem; color:#94a3b8;">Wyróżnij swój profil żywym wideo (MP4, WebM lub film YouTube)</div>
                        </div>
                    </div>

                    <!-- Podgląd w kadrze awatara -->
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:18px; padding:16px; margin-bottom:18px; text-align:center;">
                        <div class="preview-video-container" id="modalVideoPreviewWrap">
                            <video id="modalVideoPreviewEl" autoplay loop muted playsinline disablepictureinpicture></video>
                        </div>
                        <div id="modalVideoTimerLabel" style="font-size:0.80rem; font-weight:700; color:#facc15; margin-bottom:6px;">
                            ⏱️ Czas trwania: 0:00 / 0:10s (Pętla 10-sekundowa)
                        </div>
                        <div style="font-size:0.74rem; color:#94a3b8;">
                            Wideo jest odtwarzane w miejscu tradycyjnego zdjęcia profilowego.
                        </div>
                    </div>

                    <!-- Baner Misji CC / Patronat -->
                    <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(236,72,153,0.15)); border:1px solid rgba(245,158,11,0.35); border-radius:16px; padding:14px 16px; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">
                        <div style="display:flex; align-items:center; gap:10px; flex:1; min-width:240px;">
                            <i class="fa-solid fa-heart" style="color:#ec4899; font-size:1.3rem;"></i>
                            <div style="font-size:0.80rem; line-height:1.4; color:#e2e8f0;">
                                <b style="color:#facc15;">Funkcja Patronatu Misyjnego CC:</b> Wideo profilowe to ekskluzywne wyróżnienie dla Przyjaciół i Twórców wspierających dzieła ewangelizacyjne portalu LUMINA.
                            </div>
                        </div>
                        <button type="button" onclick="window.LuminaPremiumAvatar.openSupportModal()" style="background:linear-gradient(135deg,#f59e0b,#ec4899); border:none; color:#fff; font-weight:800; font-size:0.78rem; padding:8px 14px; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(236,72,153,0.4);">
                            <i class="fa-solid fa-mug-hot"></i> Postaw Kawę / Wesprzyj
                        </button>
                    </div>

                    <!-- 1. Wklej link YouTube lub URL MP4 -->
                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                            <i class="fa-brands fa-youtube" style="color:#ef4444;"></i> 1. Wklej link do filmu z YouTube (np. watch, Shorts) lub URL MP4:
                        </label>
                        <div style="display:flex; gap:8px;">
                            <input type="url" id="modalVideoUrlInput" placeholder="https://www.youtube.com/watch?v=... lub https://youtu.be/..." style="flex:1; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:10px 14px; border-radius:12px; font-size:0.82rem; font-family:inherit;">
                            <button type="button" onclick="window.LuminaPremiumAvatar.applyCustomUrl()" style="background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:#fff; font-weight:800; font-size:0.80rem; padding:10px 16px; border-radius:12px; cursor:pointer; box-shadow:0 4px 12px rgba(239,68,68,0.3);">
                                Podgląd
                            </button>
                        </div>
                    </div>

                    <!-- 2. Wgraj plik z dysku -->
                    <div style="margin-bottom:16px;">
                        <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                            <i class="fa-solid fa-cloud-arrow-up" style="color:#38bdf8;"></i> 2. Lub wgraj plik wideo z telefonu / komputera (MP4, WebM, MOV):
                        </label>
                        <div style="display:flex; gap:10px; align-items:center;">
                            <input type="file" id="modalVideoFileInput" accept="video/mp4,video/webm,video/quicktime" style="display:none;" onchange="window.LuminaPremiumAvatar.handleFileSelect(event)">
                            <button type="button" onclick="document.getElementById('modalVideoFileInput').click()" style="background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.4); color:#38bdf8; font-weight:700; font-size:0.82rem; padding:10px 16px; border-radius:12px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                                <i class="fa-solid fa-folder-open"></i> Wybierz Plik Wideo...
                            </button>
                            <span id="modalVideoFileNameLabel" style="font-size:0.75rem; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Nie wybrano pliku</span>
                        </div>
                    </div>

                    <!-- 3. Gotowe presety CC -->
                    <div style="margin-bottom:20px;">
                        <label style="display:block; font-size:0.82rem; font-weight:700; color:#cbd5e1; margin-bottom:8px;">
                            <i class="fa-solid fa-sparkles" style="color:#ec4899;"></i> 3. Lub wybierz oficjalną pętlę wideo Christian Culture:
                        </label>
                        <div style="display:grid; grid-template-columns:1fr; gap:8px;" id="modalPresetListContainer">
                            ${PRESET_VIDEOS.map(preset => `
                                <div class="preset-video-item" onclick="window.LuminaPremiumAvatar.selectPreset('${preset.url}', this)">
                                    <div>
                                        <div style="font-weight:700; font-size:0.82rem; color:#fff;">${preset.title}</div>
                                        <div style="font-size:0.72rem; color:#94a3b8;">${preset.desc}</div>
                                    </div>
                                    <span style="font-size:0.68rem; font-weight:800; background:rgba(245,158,11,0.2); color:#facc15; padding:2px 8px; border-radius:10px; border:1px solid rgba(245,158,11,0.4);">${preset.badge}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Przyciski Zapisz / Usuń -->
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px; flex-wrap:wrap;">
                        <button type="button" onclick="window.LuminaPremiumAvatar.removeVideoAvatar()" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); color:#fca5a5; font-weight:700; font-size:0.80rem; padding:10px 16px; border-radius:12px; cursor:pointer;">
                            <i class="fa-solid fa-trash-can"></i> Przywróć Zwykłe Zdjęcie
                        </button>
                        <div style="display:flex; gap:8px;">
                            <button type="button" onclick="window.LuminaPremiumAvatar.closeModal()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#cbd5e1; font-weight:700; font-size:0.80rem; padding:10px 16px; border-radius:12px; cursor:pointer;">
                                Anuluj
                            </button>
                            <button type="button" onclick="window.LuminaPremiumAvatar.saveCurrentPreview()" style="background:linear-gradient(135deg,#f59e0b,#d97706); border:none; color:#000; font-weight:800; font-size:0.84rem; padding:10px 20px; border-radius:12px; cursor:pointer; box-shadow:0 4px 14px rgba(245,158,11,0.4);">
                                <i class="fa-solid fa-check"></i> Zapisz Wideo Profilowe
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        }

        updateModalPreview(url) {
            this.previewVideoUrl = url || null;
            const wrap = document.getElementById('modalVideoPreviewWrap');
            if (!wrap) return;

            if (!url) {
                wrap.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#94a3b8; font-size:0.75rem;">Brak wideo</div>`;
                return;
            }

            const ytId = this.getYouTubeId(url);
            if (ytId) {
                const embedUrl = this.getEmbedUrl(url);
                wrap.innerHTML = `<iframe id="modalVideoPreviewIframe" src="${embedUrl}" frameborder="0" allow="autoplay; encrypted-media" style="width:100%; height:100%; border-radius:50%; border:none; pointer-events:none; object-fit:cover;"></iframe>`;
                const timerEl = document.getElementById('modalVideoTimerLabel');
                if (timerEl) {
                    timerEl.innerHTML = `⏱️ YouTube Stream • <b style="color:#ef4444;">Otwarty Odtwarzacz YouTube</b> (Automatyczna pętla YouTube)`;
                }
            } else {
                wrap.innerHTML = `<video id="modalVideoPreviewEl" autoplay loop muted playsinline disablepictureinpicture style="width:100%; height:100%; object-fit:cover; border-radius:50%;"></video>`;
                const previewEl = document.getElementById('modalVideoPreviewEl');
                if (previewEl) {
                    previewEl.src = url;
                    previewEl.load();
                    previewEl.play().catch(() => {});
                    previewEl.ontimeupdate = () => {
                        if (previewEl.currentTime >= this.maxDurationSeconds) {
                            previewEl.currentTime = 0;
                            previewEl.play().catch(() => {});
                        }
                        const timerEl = document.getElementById('modalVideoTimerLabel');
                        if (timerEl) {
                            const cur = Math.min(previewEl.currentTime, 10).toFixed(1);
                            timerEl.innerHTML = `⏱️ Czas trwania: <b>0:0${cur}</b> / 0:10s (Automatyczna pętla 10s)`;
                        }
                    };
                }
            }
        }

        openModal(slug) {
            this.currentSlug = slug || this.detectCurrentSlug();
            this.renderModal();

            const modal = document.getElementById('luminaVideoAvatarModal');
            const urlInput = document.getElementById('modalVideoUrlInput');
            const currentVideo = this.getVideoForSlug(this.currentSlug) || PRESET_VIDEOS[0].url;

            if (urlInput) {
                urlInput.value = (currentVideo && !currentVideo.startsWith('data:')) ? currentVideo : '';
            }

            this.updateModalPreview(currentVideo);
            modal.classList.add('active');
        }

        closeModal() {
            const modal = document.getElementById('luminaVideoAvatarModal');
            if (modal) modal.classList.remove('active');
            const wrap = document.getElementById('modalVideoPreviewWrap');
            if (wrap) wrap.innerHTML = '';
        }

        handleFileSelect(e) {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const label = document.getElementById('modalVideoFileNameLabel');
            if (label) label.textContent = file.name + ` (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

            if (file.size > 15 * 1024 * 1024) {
                alert('Plik jest zbyt duży (maksymalnie 15MB). Wybierz mniejszy plik wideo lub podaj link URL/YouTube.');
                return;
            }

            if (typeof window.showToast === 'function') {
                window.showToast('⏳ Wczytywanie pliku wideo...');
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                this.updateModalPreview(dataUrl);
                if (typeof window.showToast === 'function') {
                    window.showToast('🎬 Załadowano wideo z pliku! Kliknij „Zapisz Wideo Profilowe”.');
                }
            };
            reader.onerror = () => {
                alert('Nie udało się odczytać pliku wideo. Spróbuj ponownie lub podaj link URL.');
            };
            reader.readAsDataURL(file);
        }

        applyCustomUrl() {
            const input = document.getElementById('modalVideoUrlInput');
            const url = input ? input.value.trim() : '';
            if (!url) {
                alert('Podaj poprawny adres URL (np. link do filmu z YouTube lub plik MP4)');
                return;
            }

            this.updateModalPreview(url);
            if (typeof window.showToast === 'function') {
                const ytId = this.getYouTubeId(url);
                window.showToast(ytId ? '🎥 Załadowano podgląd wideo z YouTube!' : '🎬 Załadowano podgląd z adresu URL!');
            }
        }

        selectPreset(url, element) {
            this.updateModalPreview(url);
            document.querySelectorAll('.preset-video-item').forEach(el => el.classList.remove('active'));
            if (element) element.classList.add('active');
        }

        saveCurrentPreview() {
            if (!this.previewVideoUrl) {
                alert('Wybierz lub wgraj wideo przed zapisaniem.');
                return;
            }

            this.saveVideoForSlug(this.currentSlug, this.previewVideoUrl);
            this.closeModal();

            if (typeof window.showToast === 'function') {
                const ytId = this.getYouTubeId(this.previewVideoUrl);
                window.showToast(ytId ? '✨ Wideo profilowe z YouTube zostało aktywowane!' : '✨ Wideo Profilowe Premium zostało aktywowane!');
            }
        }

        removeVideoAvatar() {
            this.saveVideoForSlug(this.currentSlug, null);
            this.closeModal();

            if (typeof window.showToast === 'function') {
                window.showToast('Przywrócono standardowe zdjęcie profilowe.');
            }
        }

        openSupportModal() {
            if (typeof window.openCoffeeModal === 'function') {
                this.closeModal();
                window.openCoffeeModal();
            } else if (typeof window.openSupportCCModal === 'function') {
                this.closeModal();
                window.openSupportCCModal();
            } else {
                alert('Dziękujemy za wsparcie Misji Christian Culture! 💖 Każda wpłata rozwija chrześcijańskie media i bezpieczną przestrzeń LUMINA.');
            }
        }
    }

    // Inicjalizacja globalnej instancji
    window.LuminaPremiumAvatar = new LuminaPremiumVideoAvatarEngine();

})(window, document);
