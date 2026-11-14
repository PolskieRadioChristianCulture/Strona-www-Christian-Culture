/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA ADMIN MEDIA REPLACER (js/lumina-admin-media-replacer.js)
 * Standard Zero-Egress dla Christian Culture (JOMA-D006)
 * Pozwala Administratorowi błyskawicznie wymienić dowolny plik medialny
 * (grafikę, wideo, audio, plik do pobrania) na link z Dysku Google lub YouTube.
 * ══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    // ── 1. Zweryfikowane sprawdzenie uprawnień Administratora (wyłącznie Firebase Auth) ──
    function isMasterAdmin() {
        return Boolean(
            (global.LuminaGuard && typeof global.LuminaGuard.isMasterAdmin === 'function' && global.LuminaGuard.isMasterAdmin()) ||
            (global.LuminaDB && typeof global.LuminaDB.isLuminaMasterAdmin === 'function' && global.LuminaDB.isLuminaMasterAdmin()) ||
            (global.LuminaSecurity && typeof global.LuminaSecurity.isMasterAdmin === 'function' && global.LuminaSecurity.isMasterAdmin())
        );
    }

    // ── 2. Parser linków zewnętrznych (YouTube & Dysk Google) ──
    function parseMediaUrl(input) {
        if (!input) return null;
        const str = input.trim();

        // YouTube (watch, shorts, youtu.be, embed)
        const ytMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/i);
        if (ytMatch) {
            const id = ytMatch[1];
            return {
                type: 'youtube',
                id: id,
                embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&enablejsapi=1&playsinline=1`,
                thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                previewUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
                imageUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                original: str
            };
        }

        // Google Drive (file/d/, open?id=, uc?id=)
        const driveMatch = str.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);
        if (driveMatch) {
            const id = driveMatch[1];
            return {
                type: 'google_drive',
                id: id,
                imageUrl: `https://lh3.googleusercontent.com/d/${id}`,
                thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1920`,
                downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
                previewUrl: `https://drive.google.com/file/d/${id}/preview`,
                original: str
            };
        }

        // Standardowy bezpośredni link (CDN / zewnętrzny)
        return {
            type: 'direct_url',
            url: str,
            imageUrl: str,
            downloadUrl: str,
            embedUrl: str,
            previewUrl: str,
            original: str
        };
    }

    // ── 3. Pamięć trwałych podmian w LocalStorage ──
    function getStoredReplacements() {
        try {
            return JSON.parse(localStorage.getItem('lumina_media_replacements') || '{}');
        } catch(e) {
            return {};
        }
    }

    function saveStoredReplacement(key, data) {
        try {
            const all = getStoredReplacements();
            all[key] = data;
            localStorage.setItem('lumina_media_replacements', JSON.stringify(all));
        } catch(e) {
            console.warn('[MediaReplacer] Błąd zapisu w localStorage:', e);
        }
    }

    // Aplikuje zapisane podmiany na starcie strony i po każdej zmianie DOM
    function applySavedReplacements() {
        const replacements = getStoredReplacements();
        const keys = Object.keys(replacements);
        if (keys.length === 0) return;

        keys.forEach(key => {
            const item = replacements[key];
            if (!item || !item.replacementUrl) return;

            // 1. Szukaj po ID posta lub data-media-id
            let targetEl = document.getElementById(key) || document.querySelector(`[data-media-id="${key}"]`);

            // 2. Jeśli klucz ma prefiks 'post_' lub go nie ma
            if (!targetEl && key.startsWith('post_')) {
                const subKey = key.replace(/^post_/, '');
                targetEl = document.getElementById(subKey) || document.querySelector(`[data-media-id="${subKey}"]`);
            }
            if (!targetEl && !key.startsWith('post_')) {
                targetEl = document.getElementById('post_' + key) || document.querySelector(`[data-media-id="post_${key}"]`);
            }

            // 3. Jeśli nie znaleziono po ID, a zapisano originalSrc, szukaj po atrybucie src / href
            if (!targetEl && item.originalSrc) {
                targetEl = document.querySelector(`img[src="${item.originalSrc}"], a[href="${item.originalSrc}"], iframe[src="${item.originalSrc}"], video[src="${item.originalSrc}"], audio[src="${item.originalSrc}"]`);
            }

            if (targetEl) {
                applyReplacementToElement(targetEl, item);
            }
        });
    }

    function applyReplacementToElement(targetEl, item) {
        if (!targetEl || !item) return;

        // Jeśli to obraz (IMG)
        if (targetEl.tagName === 'IMG') {
            if (item.type === 'youtube' && item.embedUrl) {
                const parent = targetEl.parentElement;
                if (parent) {
                    let iframe = parent.querySelector('iframe.post-youtube-embed, iframe');
                    if (!iframe) {
                        iframe = document.createElement('iframe');
                        iframe.className = 'post-youtube-embed';
                        iframe.style.cssText = 'width:100%; aspect-ratio:16/9; border:none; border-radius:14px; margin:0; display:block;';
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.allowFullscreen = true;
                        parent.appendChild(iframe);
                    }
                    iframe.src = item.embedUrl;
                    iframe.style.display = 'block';
                    targetEl.style.display = 'none';
                    return;
                }
            }
            targetEl.style.display = 'block';
            targetEl.src = item.imageUrl || item.downloadUrl || item.replacementUrl;
            if (targetEl.parentElement) {
                const prevIframes = targetEl.parentElement.querySelectorAll('iframe.post-youtube-embed, iframe');
                prevIframes.forEach(f => f.remove());
            }
            return;
        }

        // Jeśli to kontener karty posta (dowolnego typu w Lumina: .feed-post-card, .post-card, .post-card-1x1, article)
        if (targetEl.classList.contains('feed-post-card') || 
            targetEl.classList.contains('post-card') || 
            targetEl.classList.contains('post-card-1x1') || 
            targetEl.tagName === 'ARTICLE') {
            
            // Szukamy głównej grafiki posta (uwzględniając wszystkie warianty Tablicy, Profili i Patronów)
            const img = targetEl.querySelector('.media-container-1x1 img, .campaign-media-container img, .broadcast-preview-wrap img, .post-featured-artwork-box img, img.post-artwork, .post-image, .post-image-box img, .post-body img, .post-content img, img:not(.post-author-img):not(.comment-avatar):not(.author-avatar):not(.nav-avatar):not(.modal-avatar)');
            const artworkBox = targetEl.querySelector('.media-container-1x1, .campaign-media-container, .broadcast-preview-wrap, .post-featured-artwork-box, .post-image-box, .post-body, .post-content') || (img ? img.parentElement : targetEl);

            if (item.type === 'youtube' && item.embedUrl) {
                let iframe = artworkBox.querySelector('iframe.post-youtube-embed, iframe');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.className = 'post-youtube-embed';
                    iframe.style.cssText = 'width:100%; aspect-ratio:16/9; border:none; border-radius:14px; margin:10px 0; display:block;';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.allowFullscreen = true;
                    artworkBox.prepend(iframe);
                }
                iframe.src = item.embedUrl;
                iframe.style.display = 'block';
                if (img) img.style.display = 'none';
            } else {
                let currentImg = img;
                if (!currentImg && artworkBox) {
                    currentImg = document.createElement('img');
                    currentImg.style.cssText = 'width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:14px; display:block;';
                    artworkBox.appendChild(currentImg);
                }
                if (currentImg) {
                    currentImg.style.display = 'block';
                    currentImg.src = item.imageUrl || item.downloadUrl || item.replacementUrl;
                }
                const prevIframes = artworkBox.querySelectorAll('iframe.post-youtube-embed, iframe');
                prevIframes.forEach(f => f.remove());
            }
            return;
        }

        // Jeśli to iframe wideo
        if (targetEl.tagName === 'IFRAME') {
            if (item.type === 'youtube' && item.embedUrl) {
                targetEl.src = item.embedUrl;
                targetEl.style.display = 'block';
                return;
            }
            // Jeśli podmieniamy istniejący iframe na grafikę
            const parent = targetEl.parentElement;
            if (parent) {
                let img = parent.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.style.cssText = 'width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:14px; display:block;';
                    parent.appendChild(img);
                }
                img.src = item.imageUrl || item.downloadUrl || item.replacementUrl;
                img.style.display = 'block';
                targetEl.remove();
            }
            return;
        }

        // Jeśli to tag HTML5 VIDEO lub AUDIO
        if (targetEl.tagName === 'VIDEO' || targetEl.tagName === 'AUDIO') {
            targetEl.src = item.downloadUrl || item.imageUrl || item.replacementUrl;
            try { targetEl.load(); } catch(e) {}
            return;
        }

        // Jeśli to link do pobrania (A)
        if (targetEl.tagName === 'A') {
            targetEl.href = item.downloadUrl || item.replacementUrl;
            targetEl.setAttribute('target', '_blank');
            targetEl.setAttribute('rel', 'noopener noreferrer');
            return;
        }
    }

    // ── 4. Wstrzykiwanie stylów dla przycisków "Wymień" i Modala ──
    function injectStyles() {
        if (document.getElementById('lumina-media-replacer-styles')) return;

        const style = document.createElement('style');
        style.id = 'lumina-media-replacer-styles';
        style.textContent = `
            /* 👑 LUMINA MEDIA REPLACER BUTTONS — TYMCZASOWE POJAWIENIE SIĘ I BRAK ZASŁANIANIA OKIEN */
            @keyframes luminaReplacerBriefNotice {
                0% {
                    opacity: 0;
                    transform: translateY(-6px) scale(0.95);
                }
                12% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                78% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-6px) scale(0.95);
                    pointer-events: none;
                }
            }

            .btn-lumina-replace-floating {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 120 !important;
                background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
                border: 1.5px solid #f59e0b;
                color: #fef08a;
                padding: 6px 14px;
                border-radius: 30px;
                font-size: 0.78rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                cursor: pointer;
                backdrop-filter: blur(12px);
                display: inline-flex;
                align-items: center;
                gap: 6px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.6), 0 0 12px rgba(245, 158, 11, 0.3);
                transition: opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                min-height: 44px;
                min-width: 44px;
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
                transform: translateY(-4px) scale(0.96);
            }

            /* Aktywne chwilowe wyświetlenie (trwa krótko i bezwzględnie znika, aby nie zasłaniać okna wideo) */
            .btn-lumina-replace-floating.is-active-reveal {
                opacity: 1 !important;
                pointer-events: auto !important;
                visibility: visible !important;
                transform: translateY(0) scale(1) !important;
            }

            .btn-lumina-replace-floating.is-active-reveal:hover {
                transform: translateY(-2px) scale(1.04) !important;
                background: #f59e0b !important;
                color: #0f172a !important;
                box-shadow: 0 6px 25px rgba(245, 158, 11, 0.6) !important;
            }

            @media (max-width: 768px) {
                .btn-lumina-replace-floating {
                    width: 44px;
                    height: 44px;
                    min-width: 44px;
                    min-height: 44px;
                    padding: 0;
                    border-radius: 50%;
                    justify-content: center;
                    font-size: 0;
                }
                .btn-lumina-replace-floating i {
                    margin: 0;
                    font-size: 1rem;
                }
            }

            .btn-lumina-replace-action {
                color: #f59e0b !important;
                border: 1px solid rgba(245, 158, 11, 0.4) !important;
                background: rgba(245, 158, 11, 0.1) !important;
                border-radius: 20px !important;
                padding: 6px 12px !important;
                font-weight: 800 !important;
                font-size: 0.78rem !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                cursor: pointer !important;
                transition: all 0.2s !important;
                min-height: 44px !important;
            }
            .btn-lumina-replace-action:hover {
                background: #f59e0b !important;
                color: #000 !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 0 14px rgba(245, 158, 11, 0.5) !important;
            }

            /* 🪟 MODAL MEDIA REPLACER (z-index ponad wszelkimi banerami i cookies: 99999999) */
            .lumina-replacer-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(3, 7, 18, 0.88);
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 99999999 !important;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 16px;
                box-sizing: border-box;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease;
            }
            .lumina-replacer-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-replacer-modal {
                background: linear-gradient(145deg, #0b1120 0%, #0f172a 100%);
                border: 1.5px solid #f59e0b;
                border-radius: 24px;
                width: 100%;
                max-width: 580px;
                padding: 26px;
                box-sizing: border-box;
                box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(245, 158, 11, 0.25);
                color: #fff;
                font-family: 'Inter', sans-serif;
                transform: scale(0.95);
                transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .lumina-replacer-overlay.active .lumina-replacer-modal {
                transform: scale(1);
            }

            .lumina-replacer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                padding-bottom: 14px;
            }
            .lumina-replacer-title {
                font-family: 'Outfit', sans-serif;
                font-size: 1.25rem;
                font-weight: 800;
                color: #fff;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .lumina-replacer-title i {
                color: #f59e0b;
            }
            .lumina-replacer-close {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #94a3b8;
                width: 38px;
                height: 38px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            .lumina-replacer-close:hover {
                background: #ef4444;
                color: #fff;
                border-color: #ef4444;
            }

            .lumina-replacer-body label {
                display: block;
                font-size: 0.85rem;
                font-weight: 700;
                color: #facc15;
                margin-bottom: 6px;
            }
            .lumina-replacer-input {
                width: 100%;
                padding: 13px 16px;
                border-radius: 12px;
                background: rgba(15, 23, 42, 0.8);
                border: 1.5px solid rgba(245, 158, 11, 0.35);
                color: #fff;
                font-size: 0.92rem;
                outline: none;
                box-sizing: border-box;
                transition: all 0.2s;
                margin-bottom: 14px;
            }
            .lumina-replacer-input:focus {
                border-color: #f59e0b;
                box-shadow: 0 0 14px rgba(245, 158, 11, 0.35);
                background: #0f172a;
            }

            .lumina-replacer-badges {
                display: flex;
                gap: 8px;
                margin-bottom: 16px;
                flex-wrap: wrap;
            }
            .lumina-replacer-badge-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                padding: 6px 12px;
                border-radius: 16px;
                font-size: 0.76rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            }
            .lumina-replacer-badge-btn:hover {
                background: rgba(245, 158, 11, 0.2);
                border-color: #f59e0b;
                color: #fff;
            }

            .lumina-replacer-preview {
                background: rgba(0, 0, 0, 0.4);
                border: 1px dashed rgba(245, 158, 11, 0.3);
                border-radius: 14px;
                padding: 12px;
                margin-bottom: 20px;
                text-align: center;
                min-height: 90px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
            }

            .lumina-replacer-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .btn-replacer-save {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #000;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                padding: 12px 24px;
                border-radius: 14px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                font-size: 0.95rem;
                transition: all 0.2s;
                box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
            }
            .btn-replacer-save:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(245, 158, 11, 0.6);
            }
            .btn-replacer-cancel {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                font-weight: 700;
                padding: 12px 20px;
                border-radius: 14px;
                cursor: pointer;
            }
            .btn-replacer-cancel:hover {
                background: rgba(255, 255, 255, 0.16);
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    // ── 5. Konstrukcja i obsługa okna modalnego ──
    let activeTargetInfo = null;

    function createReplacerModal() {
        if (document.getElementById('luminaMediaReplacerModal')) return;

        const modalHtml = `
            <div id="luminaMediaReplacerModal" class="lumina-replacer-overlay">
                <div class="lumina-replacer-modal">
                    <div class="lumina-replacer-header">
                        <div class="lumina-replacer-title">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>Wymień plik (Standard Zero-Egress)</span>
                        </div>
                        <button type="button" class="lumina-replacer-close" onclick="window.LuminaMediaReplacer.closeModal()">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="lumina-replacer-body">
                        <div style="background:rgba(245,158,11,0.08); border-left:3px solid #f59e0b; padding:10px 14px; border-radius:8px; font-size:0.80rem; color:#cbd5e1; margin-bottom:14px; line-height:1.45;">
                            🛡️ <b>Misja Bez Kosztów (@B / JOMA-D006):</b> Podmień plik na link z <b>Dysku Google</b> lub <b>YouTube</b>. Zasób nie obciąża transferu Firebase.
                        </div>

                        <div id="luminaReplacerCurrentSrc" style="font-size:0.78rem; color:#94a3b8; margin-bottom:12px; word-break:break-all;">
                            <b>Aktualny zasób:</b> <span id="luminaCurrentSrcText" style="color:#e2e8f0;">-</span>
                        </div>

                        <label for="luminaReplacerInput">Wklej link z Dysku Google lub YouTube:</label>
                        <input type="text" id="luminaReplacerInput" class="lumina-replacer-input" 
                               placeholder="np. https://drive.google.com/file/d/... lub https://youtu.be/..." 
                               autocomplete="off">

                        <div class="lumina-replacer-badges">
                            <button type="button" class="lumina-replacer-badge-btn" onclick="window.LuminaMediaReplacer.setSampleHint('yt')">
                                <i class="fa-brands fa-youtube" style="color:#ef4444;"></i> Wideo YouTube
                            </button>
                            <button type="button" class="lumina-replacer-badge-btn" onclick="window.LuminaMediaReplacer.setSampleHint('drive_img')">
                                <i class="fa-brands fa-google-drive" style="color:#3b82f6;"></i> Dysk Google (Grafika)
                            </button>
                            <button type="button" class="lumina-replacer-badge-btn" onclick="window.LuminaMediaReplacer.setSampleHint('drive_dl')">
                                <i class="fa-solid fa-file-arrow-down" style="color:#10b981;"></i> Dysk Google (Plik/Pobieranie)
                            </button>
                        </div>

                        <div class="lumina-replacer-preview" id="luminaReplacerPreview">
                            <span style="font-size:0.82rem; color:#64748b;">Tutaj pojawi się podgląd nowego zasobu po wklejeniu linku</span>
                        </div>
                    </div>

                    <div class="lumina-replacer-footer">
                        <button type="button" class="btn-replacer-cancel" onclick="window.LuminaMediaReplacer.closeModal()">Anuluj</button>
                        <button type="button" class="btn-replacer-save" onclick="window.LuminaMediaReplacer.submitReplacement()">
                            <i class="fa-solid fa-check"></i> Zapisz i Podmień
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Nasłuch na żywo dla podglądu
        const input = document.getElementById('luminaReplacerInput');
        if (input) {
            input.addEventListener('input', () => {
                updateLivePreview(input.value);
            });
        }
    }

    function updateLivePreview(val) {
        const previewBox = document.getElementById('luminaReplacerPreview');
        if (!previewBox) return;

        const parsed = parseMediaUrl(val);
        if (!parsed || !val.trim()) {
            previewBox.innerHTML = '<span style="font-size:0.82rem; color:#64748b;">Tutaj pojawi się podgląd nowego zasobu po wklejeniu linku</span>';
            return;
        }

        if (parsed.type === 'youtube') {
            previewBox.innerHTML = `
                <div style="width:100%; max-width:280px; aspect-ratio:16/9; position:relative; border-radius:10px; overflow:hidden; border:1px solid #f59e0b;">
                    <img src="${parsed.thumbnailUrl}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='${parsed.previewUrl}'">
                    <div style="position:absolute; inset:0; background:rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.8rem;">
                        <i class="fa-brands fa-youtube" style="color:#ef4444;"></i>
                    </div>
                </div>
                <div style="font-size:0.75rem; color:#a7f3d0; margin-top:6px;">✅ Rozpoznano film YouTube (ID: ${parsed.id})</div>
            `;
        } else if (parsed.type === 'google_drive') {
            previewBox.innerHTML = `
                <div style="width:100%; max-width:220px; max-height:120px; border-radius:10px; overflow:hidden; border:1px solid #3b82f6; display:flex; align-items:center; justify-content:center; background:#0f172a; margin-bottom:6px;">
                    <img src="${parsed.imageUrl}" style="max-width:100%; max-height:120px; object-fit:contain;" onerror="this.onerror=null; this.src='${parsed.thumbnailUrl}';">
                </div>
                <div style="font-size:0.75rem; color:#93c5fd;">✅ Rozpoznano Dysk Google (ID: ${parsed.id}) — transfer bezpośredni</div>
            `;
        } else {
            previewBox.innerHTML = `
                <div style="font-size:0.8rem; color:#facc15;">🌐 Bezpośredni link zewnętrzny:</div>
                <div style="font-size:0.75rem; color:#cbd5e1; word-break:break-all;">${parsed.original}</div>
            `;
        }
    }

    // ── 6. Skaner elementów i dołączanie przycisków "Wymień" ──
    function attachHostListeners(host, btn) {
        if (!host || !btn) return;
        host.classList.add('lumina-replacer-host');

        // Obsługa zdarzeń: pojawienie się TYLKO na krótką chwilę (~2.5s), a po upływie czasu BEZWZGLĘDNIE znika
        let hideTimer = null;
        const triggerBriefReveal = (duration = 2500) => {
            btn.classList.add('is-active-reveal');
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                // Bezwarunkowe ukrycie po upływie czasu — brak zasłaniania okna wideo/mediów
                btn.classList.remove('is-active-reveal');
                btn.blur();
            }, duration);
        };

        // UWAGA: Przy tworzeniu przycisku NIE wywołujemy auto-pokazywania! Przycisk jest domyślnie 100% ukryty.

        if (!host.dataset.replacerHostBound) {
            host.dataset.replacerHostBound = 'true';
            host.addEventListener('pointerenter', () => triggerBriefReveal(2500), { passive: true });
            host.addEventListener('touchstart', () => triggerBriefReveal(2500), { passive: true });
            host.addEventListener('pointerleave', () => {
                if (hideTimer) clearTimeout(hideTimer);
                hideTimer = setTimeout(() => {
                    btn.classList.remove('is-active-reveal');
                    btn.blur();
                }, 250);
            }, { passive: true });
        }

        btn.addEventListener('pointerleave', () => {
            if (hideTimer) clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                btn.classList.remove('is-active-reveal');
                btn.blur();
            }, 250);
        }, { passive: true });

        btn.addEventListener('click', () => {
            btn.classList.remove('is-active-reveal');
            btn.blur();
        });
    }

    function revealAllBriefly(duration = 2500) {
        const buttons = document.querySelectorAll('.btn-lumina-replace-floating');
        buttons.forEach(btn => {
            btn.classList.add('is-active-reveal');
        });
        setTimeout(() => {
            buttons.forEach(btn => {
                btn.classList.remove('is-active-reveal');
                btn.blur();
            });
        }, duration);
    }

    function cleanupDuplicateButtons() {
        const allButtons = Array.from(document.querySelectorAll('.btn-lumina-replace-floating'));
        for (let i = 0; i < allButtons.length; i++) {
            const b1 = allButtons[i];
            if (!b1.parentNode) continue;
            for (let j = i + 1; j < allButtons.length; j++) {
                const b2 = allButtons[j];
                if (!b2.parentNode) continue;

                const card1 = b1.closest('.post-card, .feed-post-card, .post-card-1x1, article, .sidebar-card, .card-916, .mission-live-player-wrapper');
                const card2 = b2.closest('.post-card, .feed-post-card, .post-card-1x1, article, .sidebar-card, .card-916, .mission-live-player-wrapper');

                const isSameCard = card1 && card2 && (card1 === card2 || card1.contains(b2) || card2.contains(b1));

                if (isSameCard) {
                    if (b1.innerText.includes('Wideo') && !b2.innerText.includes('Wideo')) {
                        b2.remove();
                    } else if (b2.innerText.includes('Wideo') && !b1.innerText.includes('Wideo')) {
                        b1.remove();
                    } else {
                        b2.remove();
                    }
                }
            }
        }
    }

    function scanAndAttachButtons() {
        if (!isMasterAdmin()) return;

        // 1. Karty postów (.feed-post-card, .post-card, .post-card-1x1, article, .mission-live-broadcast-card)
        const postCards = document.querySelectorAll('.feed-post-card, .post-card, .post-card-1x1, article, .mission-live-broadcast-card');
        postCards.forEach(card => {
            // Jeśli na karcie posta istnieje dedykowany player na żywo / wideo,
            // to player otrzymuje własny przycisk w kroku 2.
            const dedicatedLiveWrapper = card.querySelector('.mission-live-player-wrapper, .live-player-container, .video-container, .stream-player-box');
            if (dedicatedLiveWrapper) {
                card.querySelectorAll('.btn-lumina-replace-action').forEach(el => el.remove());
                card.querySelectorAll('.btn-lumina-replace-floating').forEach(el => {
                    if (!dedicatedLiveWrapper.contains(el)) {
                        el.remove();
                    }
                });
                return;
            }

            if (card.querySelector('.btn-lumina-replace-floating, .btn-lumina-replace-action')) {
                return;
            }

            // Sprawdzamy czy post ma grafikę lub wideo w kontenerze mediów
            const artworkBox = card.querySelector('.media-container-1x1, .campaign-media-container, .broadcast-preview-wrap, .post-featured-artwork-box, .post-image-box, .post-media-box, .post-image, .post-body img, .post-content img, .post-details-box img');
            if (artworkBox) {
                const targetWrapper = (artworkBox.tagName === 'IMG' || artworkBox.tagName === 'VIDEO') ? (artworkBox.parentElement || artworkBox) : artworkBox;
                if (!targetWrapper.querySelector('.btn-lumina-replace-floating') && !artworkBox.classList.contains('btn-lumina-replace-floating')) {
                    if (getComputedStyle(targetWrapper).position === 'static') {
                        targetWrapper.style.position = 'relative';
                    }
                    const floatBtn = document.createElement('button');
                    floatBtn.type = 'button';
                    floatBtn.className = 'btn-lumina-replace-floating';
                    floatBtn.title = 'Wymień ten plik/grafikę na link z Dysku Google lub YouTube';
                    floatBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Wymień';
                    floatBtn.onclick = (e) => {
                        e.stopPropagation();
                        const img = targetWrapper.querySelector('img, video') || (artworkBox.tagName === 'IMG' || artworkBox.tagName === 'VIDEO' ? artworkBox : null);
                        openReplacerForElement(img || card, 'image');
                    };
                    targetWrapper.appendChild(floatBtn);
                    attachHostListeners(targetWrapper, floatBtn);
                }
            } else {
                // Tylko dla postów bez grafiki i bez wideo: dodaj przycisk do DOLNEJ belki akcji (.post-actions-bar, .post-footer)
                const actionsBar = card.querySelector('.post-actions-bar, .post-footer');
                if (actionsBar && !actionsBar.querySelector('.btn-lumina-replace-action')) {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'post-action-btn btn-lumina-replace-action';
                    btn.title = 'Wymień treść posta (Zero-Egress)';
                    btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> <span class="btn-text">Wymień (Dysk/YT)</span>';
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        openReplacerForElement(card, 'post');
                    };
                    actionsBar.appendChild(btn);
                }
            }
        });

        // 2. Transmisje na żywo / Playery wideo / Ramki iframe
        const livePlayers = document.querySelectorAll('.mission-live-player-wrapper, .live-player-container, .video-container, .stream-player-box');
        livePlayers.forEach(player => {
            if (player.querySelector('.btn-lumina-replace-floating')) return;

            // Wyczyść ewentualne przyciski pływające z kontenera nadrzędnego
            const parentCard = player.closest('.post-card, .feed-post-card, .post-card-1x1, article, .sidebar-card');
            if (parentCard) {
                parentCard.querySelectorAll('.btn-lumina-replace-floating').forEach(b => {
                    if (!player.contains(b)) b.remove();
                });
            }

            if (getComputedStyle(player).position === 'static') {
                player.style.position = 'relative';
            }
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn-lumina-replace-floating';
            btn.title = 'Wymień transmisję / wideo na strumień YouTube';
            btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Wymień Wideo';
            btn.onclick = (e) => {
                e.stopPropagation();
                const iframe = player.querySelector('iframe');
                openReplacerForElement(iframe || player, 'video');
            };
            player.appendChild(btn);
            attachHostListeners(player, btn);
        });

        // 3. Samodzielne tagi AUDIO i VIDEO (poza playerami wideo i postami)
        const mediaTags = document.querySelectorAll('video, audio, .audio-player-container');
        mediaTags.forEach(media => {
            // Ignoruj media wewnątrz gotowych wrapperów playerów ORAZ kart postów i kampanii (obsługiwanych w kroku 1 i 2)
            if (media.closest('.mission-live-player-wrapper, .live-player-container, .video-container, .stream-player-box, .media-container-1x1, .campaign-media-container, .post-card, .feed-post-card, .post-card-1x1, article, .sidebar-card, .card-916, .mission-live-broadcast-card, .lumina-replacer-host')) return;
            const parent = media.parentElement || media;
            if (!parent || parent === document.body || parent === document.documentElement) return;

            if (!parent.querySelector('.btn-lumina-replace-floating') && !parent.closest('.btn-lumina-replace-floating') && !parent.dataset.replacerHostBound) {
                if (getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-lumina-replace-floating';
                btn.title = 'Wymień plik multimedialny (Audio/Wideo)';
                btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Wymień Media';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    openReplacerForElement(media, media.tagName.toLowerCase());
                };
                parent.appendChild(btn);
                attachHostListeners(parent, btn);
            }
        });

        // Końcowy automatyczny audyt i eliminacja wszelkich kolizji
        cleanupDuplicateButtons();

        // 4. Przyciski i linki pobierania plików (zip, wav, mp3, pdf, docx itp.)
        const downloadLinks = document.querySelectorAll('a[download], a[href*=".zip"], a[href*=".pdf"], a[href*=".wav"], a[href*=".mp3"], .btn-download, .file-attachment-link');
        downloadLinks.forEach(link => {
            if (link.dataset.hasReplacerBtn) return;
            link.dataset.hasReplacerBtn = 'true';

            const replaceBtn = document.createElement('button');
            replaceBtn.type = 'button';
            replaceBtn.className = 'btn-lumina-replace-action';
            replaceBtn.style.cssText = 'margin-left:8px; padding:4px 10px; font-size:0.74rem; vertical-align:middle; display:inline-flex;';
            replaceBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Wymień';
            replaceBtn.title = 'Wymień ten plik na bezpośredni link z Dysku Google';
            replaceBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                openReplacerForElement(link, 'download');
            };

            if (link.parentNode) {
                link.parentNode.insertBefore(replaceBtn, link.nextSibling);
            }
        });

        // 5. Samodzielne grafiki, avatary profilowe, banery i okładki radiowe (BEZ małych ikonek autorów postów!)
        const profileAndMediaImgs = document.querySelectorAll('.profile-avatar-wrap img, .author-avatar-wrap img, .hero-avatar-box img, .profile-cover img, .radio-player-artwork img, .now-playing-art img, .album-art img, .profile-hero img, img.profile-avatar');
        profileAndMediaImgs.forEach(img => {
            // Ignoruj awatary w nagłówkach postów i wewnątrz kart społeczności
            if (img.closest('.feed-post-card, .post-card, .post-card-1x1, article, .post-author-box, .post-header, .post-top-header')) return;
            const parent = img.parentElement || img;
            if (!parent || parent === document.body || parent === document.documentElement) return;

            if (!parent.querySelector('.btn-lumina-replace-floating') && !parent.closest('.btn-lumina-replace-floating') && !img.dataset.hasReplacerBtn) {
                if (getComputedStyle(parent).position === 'static') {
                    parent.style.position = 'relative';
                }
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn-lumina-replace-floating';
                btn.title = 'Wymień tę grafikę na link z Dysku Google';
                btn.style.padding = '4px 10px';
                btn.style.fontSize = '0.72rem';
                btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> Wymień';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    openReplacerForElement(img, 'image');
                };
                parent.appendChild(btn);
                attachHostListeners(parent, btn);
            }
        });
    }

    function openReplacerForElement(el, type) {
        createReplacerModal();
        activeTargetInfo = { element: el, type: type };

        let currentSrc = '';
        let targetId = el.id || el.getAttribute('data-media-id') || '';

        if (el.tagName === 'IMG') {
            currentSrc = el.getAttribute('src') || '';
            if (!targetId) {
                targetId = el.closest('.feed-post-card, .post-card, .post-card-1x1, article')?.id || 
                           'img_' + (currentSrc ? Math.abs(hashCode(currentSrc)) : Math.random().toString(36).substring(7));
                el.setAttribute('data-media-id', targetId);
            }
        } else if (el.tagName === 'IFRAME') {
            currentSrc = el.getAttribute('src') || '';
            if (!targetId) {
                targetId = 'iframe_' + (currentSrc ? Math.abs(hashCode(currentSrc)) : Math.random().toString(36).substring(7));
                el.setAttribute('data-media-id', targetId);
            }
        } else if (el.tagName === 'A') {
            currentSrc = el.getAttribute('href') || '';
            if (!targetId) {
                targetId = 'link_' + (currentSrc ? Math.abs(hashCode(currentSrc)) : Math.random().toString(36).substring(7));
                el.setAttribute('data-media-id', targetId);
            }
        } else if (el.tagName === 'VIDEO' || el.tagName === 'AUDIO') {
            currentSrc = el.getAttribute('src') || '';
            if (!targetId) {
                targetId = 'media_' + (currentSrc ? Math.abs(hashCode(currentSrc)) : Math.random().toString(36).substring(7));
                el.setAttribute('data-media-id', targetId);
            }
        } else if (el.classList?.contains('feed-post-card') || el.classList?.contains('post-card') || el.classList?.contains('post-card-1x1') || el.tagName === 'ARTICLE') {
            const img = el.querySelector('img:not(.post-author-img):not(.comment-avatar)');
            currentSrc = img ? img.getAttribute('src') : '';
            targetId = el.id || 'post_' + Math.random().toString(36).substring(7);
            el.setAttribute('data-media-id', targetId);
        }

        activeTargetInfo.targetId = targetId;
        activeTargetInfo.currentSrc = currentSrc;

        const srcDisplay = document.getElementById('luminaCurrentSrcText');
        if (srcDisplay) srcDisplay.textContent = currentSrc || '(brak określonego źródła)';

        const input = document.getElementById('luminaReplacerInput');
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 150);
        }

        const previewBox = document.getElementById('luminaReplacerPreview');
        if (previewBox) {
            previewBox.innerHTML = '<span style="font-size:0.82rem; color:#64748b;">Wklej link z Dysku Google lub YouTube powyżej</span>';
        }

        const modal = document.getElementById('luminaMediaReplacerModal');
        if (modal) modal.classList.add('active');
    }

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    function normStr(str) {
        return String(str || '').toLowerCase().replace(/[^a-z0-9ąćęłńóśźż]/gi, '');
    }

    let _cachedDbInstance = null;
    let _cachedDbPromise = null;

    async function getFirestoreInstance() {
        if (_cachedDbInstance) return _cachedDbInstance;
        if (window.luminaDb) {
            _cachedDbInstance = window.luminaDb;
            return _cachedDbInstance;
        }
        if (window.db) {
            _cachedDbInstance = window.db;
            return _cachedDbInstance;
        }
        if (window._luminaFirestore) {
            _cachedDbInstance = window._luminaFirestore;
            return _cachedDbInstance;
        }

        if (_cachedDbPromise) return _cachedDbPromise;

        _cachedDbPromise = (async () => {
            try {
                const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
                const { getFirestore, initializeFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
                const LUMINA_FIREBASE_CONFIG = {
                    apiKey: "AIzaSyAkX7XDMWjeUPeaIk0WdvoY4d9VhIPyD7M",
                    authDomain: "lumina-cc.firebaseapp.com",
                    databaseURL: "https://lumina-cc-default-rtdb.europe-west1.firebasedatabase.app",
                    projectId: "lumina-cc",
                    storageBucket: "lumina-cc.firebasestorage.app",
                    messagingSenderId: "413985877183",
                    appId: "1:413985877183:web:b0c99a686a4fb1b875aa0a",
                    measurementId: "G-6440T9VBQB"
                };
                const app = getApps().length > 0 ? getApp() : initializeApp(LUMINA_FIREBASE_CONFIG);
                let db = null;
                try {
                    db = initializeFirestore(app, {
                        experimentalAutoDetectLongPolling: true
                    });
                } catch(e) {
                    db = getFirestore(app);
                }
                _cachedDbInstance = db;
                window._luminaFirestore = db;
                window.luminaDb = window.luminaDb || db;
                try {
                    window.dispatchEvent(new CustomEvent('lumina:dbReady', { detail: { db } }));
                } catch(e) {}
                console.log('✅ [MediaReplacer] Firestore (lumina-cc) gotowy');
                return db;
            } catch (err) {
                console.warn('[MediaReplacer] Inicjalizacja Firestore w replacerze:', err);
                return null;
            }
        })();

        return _cachedDbPromise;
    }

    // ── 7. Zapis i natychmiastowe zastosowanie w czasie rzeczywistym ──
    async function submitReplacement() {
        const input = document.getElementById('luminaReplacerInput');
        if (!input || !activeTargetInfo) return;

        const val = input.value.trim();
        if (!val) {
            alert('Wklej prawidłowy link z Dysku Google lub YouTube.');
            return;
        }

        const parsed = parseMediaUrl(val);
        if (!parsed) {
            alert('Nie udało się rozpoznać formatu linku.');
            return;
        }

        const { element, targetId, currentSrc, type } = activeTargetInfo;

        const itemData = {
            targetId: targetId,
            originalSrc: currentSrc,
            type: parsed.type,
            originalInput: val,
            replacementUrl: parsed.imageUrl || parsed.downloadUrl || parsed.embedUrl || val,
            imageUrl: parsed.imageUrl,
            downloadUrl: parsed.downloadUrl,
            embedUrl: parsed.embedUrl,
            thumbnailUrl: parsed.thumbnailUrl,
            updatedAt: new Date().toISOString()
        };

        // 1. Zapis w LocalStorage dla natychmiastowej trwałości w przeglądarce
        saveStoredReplacement(targetId, itemData);

        // 2. Natychmiastowa podmiana w DOM w czasie rzeczywistym (0 ms)
        applyReplacementToElement(element, itemData);

        // 3. Aktualizacja obiektów w pamięci podręcznej (np. feedPosts, DEFAULT_FEED_POSTS)
        try {
            if (Array.isArray(window.DEFAULT_FEED_POSTS)) {
                const cleanTgt = (targetId || '').replace(/^post_/, '');
                window.DEFAULT_FEED_POSTS.forEach(p => {
                    if (p.id === targetId || p.id === cleanTgt || ('post_' + p.id) === targetId) {
                        if (itemData.imageUrl) p.image = itemData.imageUrl;
                        if (itemData.embedUrl) p.videoUrl = itemData.embedUrl;
                    }
                });
            }
            if (Array.isArray(window._feedPosts)) {
                const cleanTgt = (targetId || '').replace(/^post_/, '');
                window._feedPosts.forEach(p => {
                    if (p.id === targetId || p.id === cleanTgt || ('post_' + p.id) === targetId) {
                        if (itemData.imageUrl) p.image = itemData.imageUrl;
                        if (itemData.embedUrl) p.videoUrl = itemData.embedUrl;
                    }
                });
            }
        } catch(e) {}

        // 4. Rozgłoszenie zdarzenia w całym oknie (oraz innych kartach)
        try {
            window.dispatchEvent(new CustomEvent('lumina:mediaReplaced', { detail: itemData }));
        } catch(e) {}

        // 5. Autonomiczna aktualizacja w chmurze Firestore (lumina_posts i lumina_profiles)
        try {
            console.log('[MediaReplacer Debug] Rozpoczynam zapis Firestore dla targetId:', targetId);
            const dbInstance = await getFirestoreInstance();
            console.log('[MediaReplacer Debug] dbInstance:', !!dbInstance);
            if (dbInstance) {
                const { doc, getDoc, updateDoc, setDoc, collection, getDocs, limit, query } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

                // Przygotuj pełną listę unikalnych wariantów ID (czyste ID, z pojedynczym post_, bez post_)
                const rawCandidates = [
                    targetId,
                    (targetId || '').replace(/^post_/, ''),
                    (targetId || '').replace(/^(post_)+/, ''),
                    (targetId || '').replace(/^(post_)+/, 'post_'),
                    (targetId || '').replace(/^(post_cuda_)+/, 'cuda_')
                ];
                const cardEl = (element && element.closest) ? element.closest('.feed-post-card, .post-card, .post-card-1x1, article') : null;
                if (cardEl && cardEl.id) {
                    rawCandidates.push(cardEl.id);
                    rawCandidates.push(cardEl.id.replace(/^post_/, ''));
                    rawCandidates.push(cardEl.id.replace(/^(post_)+/, ''));
                    rawCandidates.push(cardEl.id.replace(/^(post_)+/, 'post_'));
                }
                const candidates = [...new Set(rawCandidates.filter(Boolean))];
                console.log('[MediaReplacer Debug] Kandydaci Firestore:', candidates);

                const cloudUpdate = {
                    updatedAt: new Date().toISOString()
                };
                if (itemData.type === 'youtube' && itemData.embedUrl) {
                    cloudUpdate.videoUrl = itemData.embedUrl;
                    cloudUpdate.image = itemData.thumbnailUrl || '';
                } else {
                    cloudUpdate.image = itemData.imageUrl || itemData.replacementUrl;
                    cloudUpdate.videoUrl = ''; // Wyzerowanie starego wideo, aby karta natychmiast przełączyła się na grafikę
                }
                if (type === 'download' && itemData.downloadUrl) {
                    cloudUpdate.downloadUrl = itemData.downloadUrl;
                }

                let updated = false;
                for (const cId of candidates) {
                    if (!cId) continue;
                    try {
                        const dRef = doc(dbInstance, 'lumina_posts', cId);
                        const snap = await getDoc(dRef);
                        if (snap.exists()) {
                            await updateDoc(dRef, cloudUpdate);
                            console.log('✅ Zaktualizowano wpis w Firestore lumina_posts po ID:', cId);
                            updated = true;
                            break;
                        }
                    } catch(e) {
                        console.warn('[MediaReplacer Debug] Błąd getDoc dla', cId, e.message);
                    }
                }

                // Fallback: dopasowanie po tytule lub slugu posta
                if (!updated && cardEl) {
                    const titleEl = cardEl.querySelector('.post-title, .post-headline, h2, h1');
                    const titleText = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
                    const normTitle = normStr(titleText);
                    const slugCandidate = (targetId || cardEl.id || '').replace(/^post_cuda_|^post_/, '');

                    try {
                        const qSnap = await getDocs(query(collection(dbInstance, 'lumina_posts'), limit(100)));
                        for (const d of qSnap.docs) {
                            const pData = d.data();
                            const pTitleNorm = normStr(pData.title);
                            const pSlug = pData.sourceSlug || pData.slug || '';

                            const titleMatch = normTitle && pTitleNorm && (normTitle.includes(pTitleNorm) || pTitleNorm.includes(normTitle));
                            const slugMatch = slugCandidate && pSlug && (pSlug === slugCandidate || slugCandidate.includes(pSlug));

                            if (titleMatch || slugMatch) {
                                await updateDoc(d.ref, cloudUpdate);
                                console.log('✅ Zaktualizowano wpis w Firestore lumina_posts po dopasowaniu (tytuł/slug):', d.id);
                                updated = true;
                                break;
                            }
                        }
                    } catch(e) {}

                    // Jeśli wpis nie istnieje jeszcze w Firestore, utwórz go na bazie karty z DOM
                    if (!updated) {
                        const newDocId = candidates.find(c => c && c.startsWith('post_')) || ('post_' + Date.now());
                        try {
                            await setDoc(doc(dbInstance, 'lumina_posts', newDocId), {
                                title: titleText || 'Wpis LUMINA',
                                author: cardEl.querySelector('.post-author-name')?.textContent.trim() || 'Andrzej Thiel',
                                authorSlug: 'andrzejthiel',
                                ...cloudUpdate
                            }, { merge: true });
                            console.log('✅ Utworzono wpis w Firestore lumina_posts:', newDocId);
                            updated = true;
                        } catch(e) {}
                    }
                }

                // Aktualizacja profili w Firestore (lumina_profiles), jeśli dotyczy
                const profileWrap = (element && element.closest) ? element.closest('[data-profile-slug], .profile-container, .profile-hero, .author-box') : null;
                const profileSlug = profileWrap?.getAttribute('data-profile-slug') || window._currentProfileSlug;
                if (profileSlug) {
                    try {
                        const pRef = doc(dbInstance, 'lumina_profiles', profileSlug);
                        const pSnap = await getDoc(pRef);
                        if (pSnap.exists()) {
                            const pUpdate = { updatedAt: new Date().toISOString() };
                            if (type === 'avatar' || element.classList?.contains('profile-avatar') || element.classList?.contains('post-author-img')) {
                                pUpdate.avatar = itemData.imageUrl || itemData.replacementUrl;
                            } else {
                                pUpdate.coverImage = itemData.imageUrl || itemData.replacementUrl;
                            }
                            await updateDoc(pRef, pUpdate);
                            console.log('✅ Zaktualizowano profil w Firestore lumina_profiles:', profileSlug);
                        }
                    } catch(e) {}
                }
            }
        } catch(err) {
            console.warn('[MediaReplacer] Firestore update notice:', err.message);
        }

        closeModal();

        if (typeof window.showToast === 'function') {
            window.showToast('✅ Plik pomyślnie wymieniony! (Standard Zero-Egress, 0 KB z Firebase)');
        } else {
            alert('✅ Plik pomyślnie wymieniony na link zewnętrzny!');
        }
    }

    function closeModal() {
        const modal = document.getElementById('luminaMediaReplacerModal');
        if (modal) modal.classList.remove('active');
        activeTargetInfo = null;
    }

    function setSampleHint(hintType) {
        const input = document.getElementById('luminaReplacerInput');
        if (!input) return;
        if (hintType === 'yt') {
            input.value = 'https://www.youtube.com/watch?v=';
        } else if (hintType === 'drive_img' || hintType === 'drive_dl') {
            input.value = 'https://drive.google.com/file/d/';
        }
        input.focus();
    }

    // ── 8. Obserwator zmian DOM (dla dynamicznie wczytywanych postów) ──
    let observerInitialized = false;
    let isInternalScanning = false;

    function safeScanAndAttachButtons() {
        if (!isMasterAdmin() || isInternalScanning) return;
        isInternalScanning = true;
        try {
            scanAndAttachButtons();
        } finally {
            setTimeout(() => { isInternalScanning = false; }, 400);
        }
    }

    function initObserver() {
        if (observerInitialized) return;
        observerInitialized = true;

        let debounceTimer = null;
        const observer = new MutationObserver((mutations) => {
            if (isInternalScanning) return;

            // Ignoruj mutacje wywoływane przez elementy samego replacera
            const isOnlyReplacer = mutations.every(m => {
                const t = m.target;
                if (t && (t.classList?.contains('btn-lumina-replace-floating') || t.classList?.contains('btn-lumina-replace-action') || t.closest?.('.btn-lumina-replace-floating, .btn-lumina-replace-action, #luminaMediaReplacerModal'))) {
                    return true;
                }
                const allNodes = [...m.addedNodes, ...m.removedNodes];
                return allNodes.length > 0 && allNodes.every(n => n.nodeType === 1 && (n.classList?.contains('btn-lumina-replace-floating') || n.classList?.contains('btn-lumina-replace-action') || n.id === 'luminaMediaReplacerModal'));
            });
            if (isOnlyReplacer) return;

            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applySavedReplacements();
                safeScanAndAttachButtons();
            }, 600);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Nasłuch zmian w localStorage z innych kart przeglądarki
    window.addEventListener('storage', (e) => {
        if (e.key === 'lumina_media_replacements') {
            applySavedReplacements();
        }
    });

    // ── 9. Globalne API ──
    global.LuminaMediaReplacer = {
        init: function() {
            injectStyles();
            applySavedReplacements();
            initObserver();
            // Samoczynna inicjalizacja instancji Firestore w tle (dla profili i postów)
            getFirestoreInstance().catch(() => {});
            if (isMasterAdmin()) {
                safeScanAndAttachButtons();
                setTimeout(() => {
                    revealAllBriefly(2500);
                }, 500);
            }
            // Zabezpieczenie na wypadek późniejszego załadowania konta admina
            setTimeout(() => {
                if (isMasterAdmin()) safeScanAndAttachButtons();
            }, 2500);
        },
        openReplacerForElement,
        submitReplacement,
        closeModal,
        setSampleHint,
        parseMediaUrl,
        scanAndAttachButtons,
        applySavedReplacements,
        revealAllBriefly,
        isMasterAdmin,
        getFirestoreInstance
    };

    // Automatyczny start po załadowaniu dokumentu
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => global.LuminaMediaReplacer.init());
    } else {
        global.LuminaMediaReplacer.init();
    }

})(window);
