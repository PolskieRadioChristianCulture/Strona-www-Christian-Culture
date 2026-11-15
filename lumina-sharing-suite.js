/**
 * ══════════════════════════════════════════════════════════════════════════
 * LUMINA UNIVERSAL SOCIAL SHARING & WEB PUSH NOTIFICATIONS SUITE (lumina-sharing-suite.js)
 * Punkt 5: Rekomendacje, Dzielenie się Treściami (Social Sharing) & Powiadomienia Web Push (PWA)
 * Ekosystem: Christian Culture
 * ══════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    let currentSharePayload = {
        title: 'LUMINA • Chrześcijańska Społeczność',
        text: 'Odkryj chrześcijański portal społecznościowy LUMINA – przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨',
        url: window.location.href.split('#')[0]
    };

    function injectSharingStyles() {
        if (document.getElementById('luminaSharingSuiteStyles')) return;
        const style = document.createElement('style');
        style.id = 'luminaSharingSuiteStyles';
        style.textContent = `
            /* ══════════ UNIVERSAL SHARE MODAL ══════════ */
            .lumina-share-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(4, 8, 20, 0.85);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                padding: 16px;
                box-sizing: border-box;
            }

            .lumina-share-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-sheet-drag-handle {
                display: none;
            }

            .lumina-share-card {
                width: 100%;
                max-width: 520px;
                background: linear-gradient(145deg, #0d1738, #070d24);
                border: 1.5px solid rgba(250, 204, 21, 0.35);
                border-radius: 24px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(234, 179, 8, 0.15);
                padding: 24px;
                color: #f8fafc;
                font-family: 'Plus Jakarta Sans', sans-serif;
                transform: scale(0.95) translateY(10px);
                transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                display: flex;
                flex-direction: column;
                gap: 18px;
            }

            .lumina-share-overlay.active .lumina-share-card {
                transform: scale(1) translateY(0);
            }

            @media (max-width: 768px) {
                .lumina-share-overlay {
                    align-items: flex-end !important;
                    padding: 0 !important;
                }

                .lumina-share-card {
                    max-width: 100% !important;
                    border-radius: 28px 28px 0 0 !important;
                    border-bottom: none !important;
                    border-left: none !important;
                    border-right: none !important;
                    border-top: 2px solid rgba(250, 204, 21, 0.6) !important;
                    padding: 12px 20px calc(24px + env(safe-area-inset-bottom, 16px)) 20px !important;
                    box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.95), 0 0 30px rgba(250, 204, 21, 0.25) !important;
                    transform: translateY(100%) !important;
                    transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    margin: 0 !important;
                    touch-action: pan-y;
                    will-change: transform;
                    max-height: 88vh !important;
                    overflow-y: auto !important;
                    gap: 14px !important;
                }

                .lumina-share-overlay.active .lumina-share-card {
                    transform: translateY(0) !important;
                }

                .lumina-sheet-drag-handle {
                    display: block !important;
                    width: 44px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.32);
                    border-radius: 999px;
                    margin: 0 auto 8px auto;
                    cursor: grab;
                    touch-action: none;
                    transition: background 0.2s ease, width 0.2s ease;
                }

                .lumina-sheet-drag-handle:active,
                .lumina-share-card.is-dragging .lumina-sheet-drag-handle {
                    background: #facc15 !important;
                    width: 52px !important;
                }
            }

            .lumina-share-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                padding-bottom: 14px;
            }

            .lumina-share-title-wrap {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .lumina-share-title-wrap i {
                font-size: 1.3rem;
                color: #facc15;
            }

            .lumina-share-title {
                font-size: 1.1rem;
                font-weight: 800;
                font-family: 'Outfit', sans-serif;
                color: #fff;
                margin: 0;
            }

            .lumina-share-preview-box {
                background: rgba(255, 255, 255, 0.04);
                border: 1px dashed rgba(255, 255, 255, 0.15);
                border-radius: 14px;
                padding: 12px 16px;
                font-size: 0.85rem;
                color: #94a3b8;
                line-height: 1.5;
            }

            .lumina-share-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
            }

            @media (max-width: 480px) {
                .lumina-share-grid {
                    grid-template-columns: repeat(3, 1fr) !important;
                    gap: 8px !important;
                }
            }

            .lumina-share-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 14px 10px;
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.08);
                color: #fff;
                font-size: 0.78rem;
                font-weight: 700;
                cursor: pointer;
                text-decoration: none;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                font-family: inherit;
            }

            .lumina-share-btn:hover {
                transform: translateY(-2px);
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.2);
            }

            .lumina-share-btn.btn-whatsapp:hover { background: #25D366; color: #000; border-color: #25D366; }
            .lumina-share-btn.btn-facebook:hover { background: #1877F2; color: #fff; border-color: #1877F2; }
            .lumina-share-btn.btn-telegram:hover { background: #229ED9; color: #fff; border-color: #229ED9; }
            .lumina-share-btn.btn-twitter:hover { background: #000; color: #fff; border-color: rgba(255,255,255,0.4); }
            .lumina-share-btn.btn-sms:hover { background: #10b981; color: #000; border-color: #10b981; }
            .lumina-share-btn.btn-native:hover { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; border-color: #f59e0b; }
            .lumina-share-btn.btn-repost-quick:hover { background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.2)); border-color: #f59e0b; color: #fde047; }

            .lumina-share-btn i {
                font-size: 1.35rem;
            }

            /* ── Repost na własnym profilu ("Udostępnij u siebie") ── */
            .lumina-share-repost-banner {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(217, 119, 6, 0.08));
                border: 1.5px solid rgba(245, 158, 11, 0.45);
                border-radius: 14px;
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
                user-select: none;
                -webkit-user-select: none;
                box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
            }

            .lumina-share-repost-banner:hover {
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.26), rgba(217, 119, 6, 0.16));
                border-color: rgba(245, 158, 11, 0.75);
                transform: translateY(-1px);
                box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
            }

            .lumina-share-repost-icon {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000;
                font-size: 1.15rem;
                flex-shrink: 0;
                box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
            }

            .lumina-share-repost-info {
                flex: 1;
                min-width: 0;
            }

            .lumina-share-repost-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.94rem;
                font-weight: 800;
                color: #fff;
                font-family: 'Outfit', sans-serif;
            }

            .lumina-share-repost-badge {
                font-size: 0.65rem;
                font-weight: 800;
                padding: 2px 7px;
                border-radius: 10px;
                background: rgba(250, 204, 21, 0.2);
                border: 1px solid rgba(250, 204, 21, 0.5);
                color: #fde047;
                text-transform: uppercase;
                letter-spacing: 0.4px;
            }

            .lumina-share-repost-sub {
                font-size: 0.76rem;
                color: #cbd5e1;
                margin-top: 2px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lumina-share-repost-arrow {
                color: #f59e0b;
                font-size: 0.95rem;
                transition: transform 0.2s;
            }

            .lumina-share-repost-banner:hover .lumina-share-repost-arrow {
                transform: translateX(3px);
            }

            .lumina-share-link-row {
                display: flex;
                gap: 8px;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 12px;
                padding: 6px 8px 6px 14px;
                align-items: center;
            }

            .lumina-share-link-input {
                background: none;
                border: none;
                color: #e2e8f0;
                font-size: 0.82rem;
                flex: 1;
                outline: none;
                font-family: monospace;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lumina-share-copy-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #000;
                font-weight: 800;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.78rem;
                font-family: inherit;
                display: flex;
                align-items: center;
                gap: 6px;
                transition: transform 0.2s;
                white-space: nowrap;
            }

            .lumina-share-copy-btn:hover {
                transform: scale(1.02);
            }

            /* ══════════ PUSH NOTIFICATIONS BANNER ══════════ */
            .lumina-push-toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                max-width: 380px;
                background: #0f1c44;
                border: 1.5px solid rgba(250, 204, 21, 0.5);
                border-radius: 18px;
                box-shadow: 0 15px 40px rgba(0,0,0,0.8), 0 0 25px rgba(250, 204, 21, 0.2);
                padding: 16px;
                z-index: 99998;
                color: #fff;
                font-family: 'Plus Jakarta Sans', sans-serif;
                display: flex;
                flex-direction: column;
                gap: 10px;
                transform: translateY(120px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .lumina-push-toast.active {
                transform: translateY(0);
                opacity: 1;
                pointer-events: auto;
            }

            .lumina-push-top {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .lumina-push-top i {
                color: #facc15;
                font-size: 1.2rem;
            }

            .lumina-push-title {
                font-size: 0.92rem;
                font-weight: 800;
                margin: 0;
                font-family: 'Outfit', sans-serif;
            }

            .lumina-push-desc {
                font-size: 0.80rem;
                color: #cbd5e1;
                line-height: 1.4;
                margin: 0;
            }

            .lumina-push-actions {
                display: flex;
                gap: 8px;
                margin-top: 4px;
            }

            .lumina-push-accept {
                flex: 1;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border: none;
                color: #000;
                font-weight: 800;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.78rem;
                cursor: pointer;
                font-family: inherit;
            }

            .lumina-push-dismiss {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                color: #cbd5e1;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 0.78rem;
                cursor: pointer;
                font-family: inherit;
            }

            /* ══════════ POST SHARE DOCK (8 CANONICAL SHARING ICONS) ══════════ */
            .post-share-dock {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 14px;
                background: rgba(11, 18, 33, 0.55);
                border-top: 1px solid rgba(255, 255, 255, 0.05);
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                gap: 10px;
                flex-wrap: wrap;
                box-sizing: border-box;
            }

            .post-share-dock-inner {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 8px;
                flex-wrap: wrap;
            }

            .post-share-dock-label {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-size: 0.78rem;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                user-select: none;
            }

            .post-share-dock-label i {
                color: var(--cc-gold, #D4A94A);
                font-size: 0.85rem;
            }

            .post-share-dock-actions {
                display: flex;
                align-items: center;
                gap: 6px;
                flex-wrap: wrap;
            }

            .post-share-btn {
                width: 38px;
                height: 38px;
                min-width: 38px;
                min-height: 38px;
                border-radius: 50%;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255, 255, 255, 0.12);
                background: rgba(255, 255, 255, 0.04);
                color: #cbd5e1;
                font-size: 0.90rem;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                padding: 0;
                margin: 0;
                touch-action: manipulation;
                text-decoration: none;
                box-sizing: border-box;
            }

            .post-share-btn:hover {
                transform: translateY(-2px) scale(1.06);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
            }

            .post-share-btn .glyph-l {
                font-family: 'Cinzel', 'Montserrat', serif, system-ui;
                font-weight: 900;
                font-size: 0.98rem;
                color: #ffffff !important;
            }

            .post-share-btn.share-lumina {
                background: linear-gradient(135deg, #b3182d 0%, #8f0f22 100%) !important;
                border: 1.5px solid #d4af37 !important;
                color: #ffffff !important;
                box-shadow: 0 2px 8px rgba(166, 18, 41, 0.45), 0 0 8px rgba(212, 175, 55, 0.3);
            }

            .post-share-btn.share-lumina:hover {
                background: linear-gradient(135deg, #c71f37 0%, #a01227 100%) !important;
                border-color: #facc15 !important;
                color: #ffffff !important;
                box-shadow: 0 0 16px rgba(212, 175, 55, 0.6), 0 4px 14px rgba(166, 18, 41, 0.5) !important;
                transform: translateY(-2px) scale(1.08);
            }

            .post-share-btn.share-wa:hover {
                background: #25D366;
                border-color: #25D366;
                color: #0b141a;
                box-shadow: 0 0 12px rgba(37, 211, 102, 0.4);
            }

            .post-share-btn.share-fb:hover {
                background: #1877F2;
                border-color: #1877F2;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(24, 119, 242, 0.4);
            }

            .post-share-btn.share-tg:hover {
                background: #229ED9;
                border-color: #229ED9;
                color: #ffffff;
                box-shadow: 0 0 12px rgba(34, 158, 217, 0.4);
            }

            .post-share-btn.share-x:hover {
                background: #000000;
                border-color: rgba(255, 255, 255, 0.6);
                color: #ffffff;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
            }

            .post-share-btn.share-mail:hover {
                background: #e2cc9a;
                border-color: #e2cc9a;
                color: #161b26;
                box-shadow: 0 0 12px rgba(226, 204, 154, 0.4);
            }

            .post-share-btn.share-copy:hover {
                background: var(--cc-gold, #D4A94A);
                border-color: var(--cc-gold, #D4A94A);
                color: #07090E;
                box-shadow: 0 0 12px rgba(212, 169, 74, 0.4);
            }

            .post-share-btn.share-more:hover {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-color: #f59e0b;
                color: #000000;
                box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
            }

            /* Light theme support */
            html[data-lumina-theme="light"] .post-share-dock,
            body.light-mode .post-share-dock {
                background: #faf8f5 !important;
                border-top: 1px solid rgba(28, 25, 23, 0.08) !important;
            }

            html[data-lumina-theme="light"] .post-share-dock-label,
            body.light-mode .post-share-dock-label {
                color: #78716c !important;
            }

            html[data-lumina-theme="light"] .post-share-btn:not(.share-lumina),
            body.light-mode .post-share-btn:not(.share-lumina) {
                background: #ffffff !important;
                border: 1px solid rgba(184, 142, 62, 0.3) !important;
                color: #44403c !important;
            }

            html[data-lumina-theme="light"] .post-share-btn.share-lumina,
            body.light-mode .post-share-btn.share-lumina {
                background: linear-gradient(135deg, #b3182d 0%, #8f0f22 100%) !important;
                border: 1.5px solid #d4af37 !important;
                color: #ffffff !important;
                box-shadow: 0 2px 8px rgba(166, 18, 41, 0.45), 0 0 8px rgba(212, 175, 55, 0.3) !important;
            }

            html[data-lumina-theme="light"] .post-share-btn.share-lumina .glyph-l,
            body.light-mode .post-share-btn.share-lumina .glyph-l {
                color: #ffffff !important;
            }

            @media (max-width: 768px) {
                .post-share-dock {
                    padding: 8px 10px !important;
                }
                .post-share-dock-inner {
                    flex-direction: row !important;
                    align-items: center !important;
                    justify-content: space-between !important;
                }
                .post-share-dock-label {
                    font-size: 0.72rem !important;
                }
                .post-share-dock-actions {
                    gap: 6px !important;
                }
                .post-share-btn {
                    width: 38px !important;
                    height: 38px !important;
                    min-width: 38px !important;
                    min-height: 38px !important;
                    font-size: 0.86rem !important;
                }
            }

            @media (max-width: 480px) {
                .post-share-dock-label {
                    display: none !important;
                }
                .post-share-dock-actions {
                    width: 100% !important;
                    justify-content: space-between !important;
                }
                .post-share-btn {
                    width: 36px !important;
                    height: 36px !important;
                    min-width: 36px !important;
                    min-height: 36px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createSharingModalDOM() {
        if (document.getElementById('luminaShareModalOverlay')) return;
        const div = document.createElement('div');
        div.id = 'luminaShareModalOverlay';
        div.className = 'lumina-share-overlay';
        div.onclick = function(e) {
            if (e.target === div) closeShareModal();
        };

        div.innerHTML = `
            <div class="lumina-share-card" onclick="event.stopPropagation()">
                <div class="lumina-sheet-drag-handle" id="luminaShareDragHandle" title="Przeciągnij w dół, aby zamknąć"></div>
                
                <!-- ══ WIDOK 1: Główne Opcje Udostępniania ══ -->
                <div id="luminaShareMainView">
                    <div class="lumina-share-header">
                        <div class="lumina-share-title-wrap">
                            <i class="fa-solid fa-share-nodes"></i>
                            <h3 class="lumina-share-title" id="luminaShareModalHeading">Poleć & Udostępnij</h3>
                        </div>
                        <button type="button" onclick="window.closeShareModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:4px;" title="Zamknij"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Baner "Udostępnij u siebie" na własnym profilu LUMINA -->
                    <div class="lumina-share-repost-banner" id="luminaShareRepostBanner" onclick="window.openLuminaRepostComposer()" role="button" tabindex="0" title="Udostępnij ten wpis na własnym profilu LUMINA" style="margin-bottom:14px;">
                        <div class="lumina-share-repost-icon">
                            <i class="fa-solid fa-repeat"></i>
                        </div>
                        <div class="lumina-share-repost-info">
                            <div class="lumina-share-repost-title">
                                <span>Udostępnij u siebie</span>
                                <span class="lumina-share-repost-badge">Na profilu</span>
                            </div>
                            <div class="lumina-share-repost-sub" id="luminaShareRepostSub">Opublikuj ten wpis na swoim profilu LUMINA 🕊️</div>
                        </div>
                        <i class="fa-solid fa-chevron-right lumina-share-repost-arrow"></i>
                    </div>

                    <div class="lumina-share-preview-box" id="luminaSharePreviewText" style="margin-bottom:14px;">
                        Odkryj chrześcijański portal społecznościowy LUMINA...
                    </div>

                    <div class="lumina-share-grid" style="margin-bottom:14px;">
                        <button type="button" class="lumina-share-btn btn-lumina-board" onclick="window.executeShareTo('lumina')" title="Opublikuj na Tablicy Społeczności LUMINA">
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:5px; background:linear-gradient(135deg,#f59e0b,#d97706); color:#000; font-weight:900; font-family:'Cinzel',serif; font-size:14px; line-height:1; box-shadow:0 0 8px rgba(250,204,21,0.6);">L</span>
                            <span style="color:#fde047; font-weight:900;">Tablica</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-repost-quick" onclick="window.openLuminaRepostComposer()" title="Udostępnij na swoim profilu LUMINA">
                            <i class="fa-solid fa-repeat" style="color:#f59e0b;"></i>
                            <span style="color:#fef08a; font-weight:800;">U siebie</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-whatsapp" onclick="window.executeShareTo('whatsapp')">
                            <i class="fa-brands fa-whatsapp"></i>
                            <span>WhatsApp</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-facebook" onclick="window.executeShareTo('facebook')">
                            <i class="fa-brands fa-facebook-f"></i>
                            <span>Facebook</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-telegram" onclick="window.executeShareTo('telegram')">
                            <i class="fa-brands fa-telegram"></i>
                            <span>Telegram</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-twitter" onclick="window.executeShareTo('twitter')">
                            <i class="fa-brands fa-x-twitter"></i>
                            <span>X / Twitter</span>
                        </button>
                        <button type="button" class="lumina-share-btn btn-native" onclick="window.executeShareTo('native')">
                            <i class="fa-solid fa-arrow-up-from-bracket"></i>
                            <span>Więcej...</span>
                        </button>
                    </div>

                    <div class="lumina-share-link-row">
                        <input type="text" readonly class="lumina-share-link-input" id="luminaShareUrlInput" value="${window.location.href}">
                        <button type="button" class="lumina-share-copy-btn" onclick="window.copyShareModalUrl()">
                            <i class="fa-solid fa-copy"></i> Kopiuj Link
                        </button>
                    </div>
                </div>

                <!-- ══ WIDOK 2: Edytor Repostu na Profilu ("Udostępnij u siebie") ══ -->
                <div id="luminaShareComposerView" style="display:none; flex-direction:column; gap:12px;">
                    <div class="lumina-share-header">
                        <button type="button" onclick="window.backToShareMainView()" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); color:#cbd5e1; border-radius:10px; padding:6px 12px; font-size:0.78rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-family:inherit;">
                            <i class="fa-solid fa-arrow-left"></i> Wróć
                        </button>
                        <div class="lumina-share-title-wrap" style="flex:1; justify-content:center;">
                            <i class="fa-solid fa-repeat" style="color:#f59e0b;"></i>
                            <h3 class="lumina-share-title" style="font-size:1.02rem;">Udostępnij na profilu</h3>
                        </div>
                        <button type="button" onclick="window.closeShareModal()" style="background:none; border:none; color:#94a3b8; font-size:1.2rem; cursor:pointer; padding:4px;" title="Zamknij"><i class="fa-solid fa-xmark"></i></button>
                    </div>

                    <!-- Kto udostępnia (Aktywny profil) -->
                    <div id="luminaRepostAuthorRow" style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(255,255,255,0.04); border-radius:12px; border:1px solid rgba(255,255,255,0.08);">
                        <img id="luminaRepostUserAvatar" src="lumina_icon.jpg" alt="Twój profil" style="width:38px; height:38px; border-radius:50%; object-fit:cover; border:1.5px solid #f59e0b;" onerror="this.src='lumina_icon.jpg'">
                        <div style="min-width:0; flex:1;">
                            <div id="luminaRepostUserName" style="font-weight:700; font-size:0.88rem; color:#fff;">Twój Profil</div>
                            <div style="font-size:0.72rem; color:#94a3b8; display:flex; align-items:center; gap:4px;">
                                <i class="fa-solid fa-earth-americas" style="font-size:0.65rem; color:#38bdf8;"></i>
                                <span>Publikujesz na swoim profilu • Publiczny</span>
                            </div>
                        </div>
                    </div>

                    <!-- Pole na własny komentarz -->
                    <div style="display:flex; flex-direction:column; gap:4px;">
                        <label for="luminaRepostCommentInput" style="font-size:0.76rem; font-weight:700; color:#cbd5e1;">Twój komentarz do wpisu (opcjonalnie):</label>
                        <textarea id="luminaRepostCommentInput" class="lumina-repost-textarea" placeholder="Napisz coś od siebie... Jak ten wpis Cię poruszył? 🕊️✨" rows="3" style="width:100%; border-radius:12px; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.18); color:#fff; font-family:inherit; font-size:0.88rem; padding:10px 12px; resize:vertical; outline:none; transition:border-color 0.2s; box-sizing:border-box;"></textarea>
                    </div>

                    <!-- Podgląd cytowanego wpisu -->
                    <div id="luminaRepostQuotePreview" style="border:1px dashed rgba(245,158,11,0.5); background:rgba(15,23,42,0.65); border-radius:14px; padding:12px; max-height:160px; overflow-y:auto;">
                        <!-- dynamic quote content -->
                    </div>

                    <!-- Przyciski akcji -->
                    <div style="display:flex; gap:10px; align-items:center; margin-top:4px;">
                        <button type="button" onclick="window.backToShareMainView()" style="flex:1; min-height:44px; padding:10px; border-radius:12px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#cbd5e1; font-weight:700; font-size:0.84rem; cursor:pointer; font-family:inherit;">
                            Anuluj
                        </button>
                        <button type="button" id="btnSubmitLuminaRepost" onclick="window.submitLuminaRepost()" style="flex:2; min-height:44px; padding:10px 16px; border-radius:12px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:#000; font-weight:800; font-size:0.88rem; cursor:pointer; font-family:inherit; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 4px 14px rgba(245,158,11,0.35);">
                            <i class="fa-solid fa-repeat"></i>
                            <span>Opublikuj na moim profilu 🕊️</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div);

        // ── Touch Gesture: Swipe-to-Dismiss on Mobile ──
        const card = div.querySelector('.lumina-share-card');
        const dragHandle = div.querySelector('#luminaShareDragHandle');
        const header = div.querySelector('.lumina-share-header');

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const onTouchStart = (e) => {
            if (window.innerWidth > 768) return;
            const target = e.target;
            if (dragHandle.contains(target) || header.contains(target) || card.scrollTop <= 0) {
                startY = e.touches[0].clientY;
                currentY = startY;
                isDragging = true;
                card.classList.add('is-dragging');
                card.style.transition = 'none';
            }
        };

        const onTouchMove = (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            if (deltaY > 0) {
                card.style.transform = `translateY(${deltaY}px)`;
                if (e.cancelable) e.preventDefault();
            } else {
                card.style.transform = `translateY(${deltaY * 0.15}px)`;
            }
        };

        const onTouchEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            card.classList.remove('is-dragging');
            const deltaY = currentY - startY;
            card.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
            if (deltaY > 80) {
                closeShareModal();
            } else {
                card.style.transform = 'translateY(0)';
            }
        };

        card.addEventListener('touchstart', onTouchStart, { passive: true });
        card.addEventListener('touchmove', onTouchMove, { passive: false });
        card.addEventListener('touchend', onTouchEnd, { passive: true });

        // Global Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && div.classList.contains('active')) {
                closeShareModal();
            }
        });

        // Push toast DOM
        const pushDiv = document.createElement('div');
        pushDiv.id = 'luminaPushToastPrompt';
        pushDiv.className = 'lumina-push-toast';
        pushDiv.innerHTML = `
            <div class="lumina-push-top">
                <i class="fa-solid fa-bell"></i>
                <h4 class="lumina-push-title">Bądź na bieżąco z LUMINA</h4>
            </div>
            <p class="lumina-push-desc">Włącz powiadomienia, aby nie przegapić nowych wiadomości, modlitw i wpisów na Tablicy Społeczności.</p>
            <div class="lumina-push-actions">
                <button type="button" class="lumina-push-accept" onclick="window.requestLuminaPushNotifications()">Włącz powiadomienia 🔔</button>
                <button type="button" class="lumina-push-dismiss" onclick="window.dismissPushToast()">Później</button>
            </div>
        `;
        document.body.appendChild(pushDiv);
    }

    // ── Helper HTML Escaper ──
    function escapeLuminaHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ── Active User Profile Resolver ──
    function getActiveLuminaUserProfile() {
        // 1. LuminaDB getCurrentProfile
        if (window.LuminaDB && typeof window.LuminaDB.getCurrentProfile === 'function') {
            const p = window.LuminaDB.getCurrentProfile();
            if (p && p.name && p.slug && p.slug !== 'guest' && p.slug !== 'gosc') return p;
        }
        // 2. Explicit current user slug profile
        const curSlug = localStorage.getItem('lumina_current_user_slug');
        if (curSlug && curSlug !== 'guest' && curSlug !== 'gosc') {
            try {
                const raw = localStorage.getItem(`lumina_profile_${curSlug}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.name) return parsed;
                }
            } catch(e) {}
        }
        // 3. Known profile keys
        const profileKeys = ['lumina_current_user_profile', 'lumina_my_profile', 'lumina_main_user_profile'];
        for (const k of profileKeys) {
            try {
                const raw = localStorage.getItem(k);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.name) return parsed;
                }
            } catch(e) {}
        }
        // 4. Cezary Rogowski fallback wyłącznie po zweryfikowanym logowaniu Administratora lub na jego profilu
        const isAdmin = !!(window.LuminaGuard && typeof window.LuminaGuard.isMasterAdmin === 'function' && window.LuminaGuard.isMasterAdmin());
        if (isAdmin || window.location.pathname.includes('cezary')) {
            return {
                name: 'Cezary Rogowski',
                slug: 'cezaryrgowski',
                avatar: 'avatar_cezary_official.jpg',
                role: 'Założyciel Christian Culture 🕊️'
            };
        }
        // 5. Default Lumina member
        return {
            name: 'Użytkownik LUMINA',
            slug: curSlug || 'u_spolecznosc',
            avatar: 'lumina_icon.jpg',
            role: 'Społeczność LUMINA ✨'
        };
    }

    // ── Social Share Functions ──
    function openShareModal(options = {}) {
        injectSharingStyles();
        createSharingModalDOM();

        const title = options.title || 'LUMINA • Chrześcijańska Społeczność';
        const text = options.text || 'Odkryj chrześcijański portal społecznościowy LUMINA – przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨';
        const url = options.url || window.location.href;
        const post = options.post || options.postData || null;

        currentSharePayload = { title, text, url, post };

        // Reset to Step 1
        backToShareMainView();

        const headingEl = document.getElementById('luminaShareModalHeading');
        if (headingEl) headingEl.textContent = options.heading || 'Poleć & Udostępnij';

        const previewEl = document.getElementById('luminaSharePreviewText');
        if (previewEl) previewEl.textContent = text;

        const inputEl = document.getElementById('luminaShareUrlInput');
        if (inputEl) inputEl.value = url;

        const repostSubEl = document.getElementById('luminaShareRepostSub');
        if (repostSubEl) {
            if (post) {
                const authorName = post.author || 'autora';
                repostSubEl.textContent = `Opublikuj wpis ${authorName} na swoim profilu LUMINA 🕊️`;
            } else {
                repostSubEl.textContent = 'Poleć ten portal na swoim profilu LUMINA 🕊️';
            }
        }

        const overlay = document.getElementById('luminaShareModalOverlay');
        if (overlay) {
            const card = overlay.querySelector('.lumina-share-card');
            if (card) {
                card.style.transform = '';
                card.style.transition = '';
            }
            overlay.classList.add('active');
        }
    }

    function closeShareModal() {
        const overlay = document.getElementById('luminaShareModalOverlay');
        if (!overlay) return;
        backToShareMainView();
        const card = overlay.querySelector('.lumina-share-card');
        if (card && window.innerWidth <= 768) {
            card.style.transition = 'transform 0.26s cubic-bezier(0.4, 0, 1, 1)';
            card.style.transform = 'translateY(100%)';
            setTimeout(() => {
                overlay.classList.remove('active');
                card.style.transform = '';
                card.style.transition = '';
            }, 260);
        } else {
            overlay.classList.remove('active');
        }
    }

    // ── Repost Composer Navigation & Actions ──
    function openLuminaRepostComposer() {
        const user = getActiveLuminaUserProfile();
        const post = currentSharePayload.post || {
            id: 'portal_lumina_' + Date.now(),
            author: currentSharePayload.title || 'LUMINA',
            text: currentSharePayload.text || 'Odkryj portal społecznościowy LUMINA 🕊️',
            url: currentSharePayload.url || window.location.href,
            authorAvatar: 'lumina_icon.jpg'
        };

        const mainView = document.getElementById('luminaShareMainView');
        const composerView = document.getElementById('luminaShareComposerView');
        if (!mainView || !composerView) return;

        // Populate user info
        const userAvatarEl = document.getElementById('luminaRepostUserAvatar');
        const userNameEl = document.getElementById('luminaRepostUserName');
        if (userAvatarEl) userAvatarEl.src = user.avatar || 'lumina_icon.jpg';
        if (userNameEl) userNameEl.textContent = user.name || 'Twój Profil';

        // Clear comment input
        const commentInput = document.getElementById('luminaRepostCommentInput');
        if (commentInput) {
            commentInput.value = '';
        }

        // Build preview of quoted post
        const previewEl = document.getElementById('luminaRepostQuotePreview');
        if (previewEl) {
            const author = post.author || 'LUMINA';
            const avatar = post.authorAvatar || 'lumina_icon.jpg';
            const text = post.text || post.desc || currentSharePayload.text || '';
            const title = post.title || '';
            const snippet = text.length > 180 ? (text.substring(0, 180) + '...') : text;

            let mediaPreview = '';
            if (post.image) {
                mediaPreview = `<div style="margin-top:8px; border-radius:10px; overflow:hidden; max-height:120px; background:#000;">
                    <img src="${post.image}" style="width:100%; height:120px; object-fit:cover; display:block;" alt="${escapeLuminaHtml(author)}">
                </div>`;
            }

            previewEl.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                    <img src="${avatar}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.2);" onerror="this.src='lumina_icon.jpg'">
                    <div style="font-size:0.82rem; font-weight:700; color:#f8fafc; display:flex; align-items:center; gap:4px;">
                        <span>${escapeLuminaHtml(author)}</span>
                        <i class="fa-solid fa-circle-check" style="color:#38bdf8; font-size:0.68rem;"></i>
                    </div>
                </div>
                ${title ? `<div style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:4px;">${escapeLuminaHtml(title)}</div>` : ''}
                <div style="font-size:0.80rem; color:#cbd5e1; line-height:1.45;">${escapeLuminaHtml(snippet)}</div>
                ${mediaPreview}
            `;
        }

        mainView.style.display = 'none';
        composerView.style.display = 'flex';

        setTimeout(() => {
            if (commentInput) commentInput.focus();
        }, 120);
    }

    function backToShareMainView() {
        const mainView = document.getElementById('luminaShareMainView');
        const composerView = document.getElementById('luminaShareComposerView');
        if (mainView && composerView) {
            composerView.style.display = 'none';
            mainView.style.display = 'block';
        }
    }

    async function submitLuminaRepost() {
        const btn = document.getElementById('btnSubmitLuminaRepost');
        const commentInput = document.getElementById('luminaRepostCommentInput');
        const userComment = commentInput ? commentInput.value.trim() : '';

        const user = getActiveLuminaUserProfile();
        const quoted = currentSharePayload.post || {
            id: 'portal_lumina_' + Date.now(),
            author: currentSharePayload.title || 'LUMINA',
            text: currentSharePayload.text || 'Odkryj portal społecznościowy LUMINA 🕊️',
            url: currentSharePayload.url || window.location.href,
            authorAvatar: 'lumina_icon.jpg'
        };

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publikowanie...';
        }

        const repostId = 'post_repost_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
        const newPost = {
            id: repostId,
            type: 'post',
            isRepost: true,
            repostComment: userComment,
            text: userComment || `Udostępniono wpis: ${quoted.author || 'LUMINA'}`,
            title: userComment ? '' : `Udostępnienie wpisu: ${quoted.author || 'LUMINA'}`,
            author: user.name,
            authorSlug: user.slug,
            authorAvatar: user.avatar,
            authorRole: user.role || 'Społeczność LUMINA ✨',
            _sortTs: Date.now(),
            sharedPost: {
                id: quoted.id || ('quoted_' + Date.now()),
                author: quoted.author || 'LUMINA',
                authorSlug: quoted.authorSlug || '',
                authorAvatar: quoted.authorAvatar || 'lumina_icon.jpg',
                authorRole: quoted.authorRole || '',
                title: quoted.title || '',
                text: quoted.text || quoted.desc || '',
                image: quoted.image || null,
                videoUrl: quoted.videoUrl || quoted.youtubeUrl || null,
                time: quoted.time || '',
                url: quoted.url || (window.location.origin + window.location.pathname + '#' + (quoted.id || ''))
            },
            likes: 1,
            amen: 0,
            time: 'Przed chwilą • Udostępniono 🕊️',
            createdAtTimestamp: Date.now(),
            createdAtDateStr: new Date().toISOString()
        };

        // 1. Zapis do pamięci podręcznej najświeższego wpisu (Lumina Quick Publisher Spotlight)
        try {
            localStorage.setItem('lumina_recent_published_post', JSON.stringify(newPost));
        } catch(e) {}

        // 2. Bezpośredni zapis do profilu autora w LocalStorage (offline-first)
        try {
            const profileKey = `lumina_profile_${user.slug}`;
            const rawProfile = localStorage.getItem(profileKey);
            let profileObj = rawProfile ? JSON.parse(rawProfile) : { name: user.name, slug: user.slug, posts: [] };
            if (!Array.isArray(profileObj.posts)) profileObj.posts = [];
            profileObj.posts.unshift(newPost);
            localStorage.setItem(profileKey, JSON.stringify(profileObj));

            if (user.slug === 'cezaryrgowski') {
                ['lumina_main_user_profile', 'lumina_current_user_profile', 'lumina_my_profile'].forEach(k => {
                    try {
                        const r = localStorage.getItem(k);
                        let p = r ? JSON.parse(r) : null;
                        if (p) {
                            if (!Array.isArray(p.posts)) p.posts = [];
                            p.posts.unshift(newPost);
                            localStorage.setItem(k, JSON.stringify(p));
                        }
                    } catch(err) {}
                });
            }
        } catch(e) {}

        // 3. Zapis do lumina_cloud_posts_cache
        try {
            const rawCloud = localStorage.getItem('lumina_cloud_posts_cache');
            let cloudPosts = rawCloud ? JSON.parse(rawCloud) : [];
            cloudPosts.unshift(newPost);
            localStorage.setItem('lumina_cloud_posts_cache', JSON.stringify(cloudPosts));
        } catch(e) {}

        // 4. Publikacja przez LuminaDB jeśli dostępne
        if (window.LuminaDB && typeof window.LuminaDB.publishUniversalPost === 'function') {
            try {
                await window.LuminaDB.publishUniversalPost(newPost);
            } catch(e) {
                console.warn('LuminaDB publishUniversalPost warning:', e);
            }
        }

        // 5. Rozgłoszenie zdarzeń reaktywnych
        window.dispatchEvent(new CustomEvent('lumina_post_published', { detail: newPost }));
        window.dispatchEvent(new Event('storage'));

        // 6. Odświeżenie widoków na aktywnej stronie
        if (typeof window.renderFeed === 'function') {
            window.renderFeed();
        }
        if (typeof window.renderPosts === 'function') {
            window.renderPosts();
        }

        // 7. Sukces & Zamknięcie
        closeShareModal();
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-repeat"></i> Opublikuj na moim profilu 🕊️';
        }

        if (typeof showToast === 'function') {
            showToast('Wpis został pomyślnie udostępniony na Twoim profilu! ✨🕊️');
        } else {
            alert('Wpis został pomyślnie udostępniony na Twoim profilu! ✨🕊️');
        }
    }

    // ── Universal Quoted Post Card Builder ──
    function buildQuotedPostHtml(sp) {
        if (!sp) return '';
        const author = escapeLuminaHtml(sp.author || 'Użytkownik LUMINA');
        const avatar = sp.authorAvatar || 'lumina_icon.jpg';
        const title = sp.title ? escapeLuminaHtml(sp.title) : '';
        const text = sp.text ? escapeLuminaHtml(sp.text) : (sp.desc ? escapeLuminaHtml(sp.desc) : '');
        const time = sp.time ? escapeLuminaHtml(sp.time) : '';
        const url = sp.url || (sp.id ? ('#' + sp.id) : '');

        let mediaHtml = '';
        if (sp.image) {
            mediaHtml = `
                <div style="margin-top:10px; border-radius:12px; overflow:hidden; max-height:280px; background:#000; border:1px solid rgba(255,255,255,0.08);">
                    <img src="${sp.image}" alt="${author}" style="width:100%; height:auto; max-height:280px; object-fit:cover; display:block;" loading="lazy" onerror="this.style.display='none'">
                </div>`;
        } else if (sp.videoUrl || sp.youtubeUrl) {
            const rawVid = sp.videoUrl || sp.youtubeUrl;
            const ytMatch = String(rawVid).match(/(?:youtube(?:-nocookie)?\.com\/(?:[^\/\s"']+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
            if (ytMatch && ytMatch[1]) {
                mediaHtml = `
                    <div style="margin-top:10px; border-radius:12px; overflow:hidden; aspect-ratio:16/9; background:#000;">
                        <iframe src="https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0" style="width:100%; height:100%; border:none; display:block;" allowfullscreen loading="lazy"></iframe>
                    </div>`;
            }
        }

        return `
        <div class="lumina-quoted-post-card" style="margin-top:10px; margin-bottom:12px; padding:14px; border-radius:16px; background:linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.75)); border:1.5px solid rgba(245,158,11,0.35); box-shadow:0 4px 18px rgba(0,0,0,0.35);">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px;">
                <div style="display:flex; align-items:center; gap:10px; min-width:0;">
                    <img src="${avatar}" alt="${author}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.2);" onerror="this.src='lumina_icon.jpg'">
                    <div style="min-width:0; overflow:hidden;">
                        <div style="font-weight:700; font-size:0.86rem; color:#f8fafc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:flex; align-items:center; gap:5px;">
                            <span>${author}</span>
                            <i class="fa-solid fa-circle-check" style="color:#38bdf8; font-size:0.7rem;"></i>
                        </div>
                        ${time ? `<div style="font-size:0.70rem; color:#94a3b8;">${time}</div>` : ''}
                    </div>
                </div>
                ${url ? `
                <a href="${url}" style="padding:4px 10px; border-radius:10px; background:rgba(250,204,21,0.12); border:1px solid rgba(250,204,21,0.3); color:#facc15; font-size:0.72rem; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:5px; flex-shrink:0;">
                    <span>Zobacz oryginał</span> <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:0.65rem;"></i>
                </a>` : ''}
            </div>
            ${title ? `<div style="font-weight:700; font-size:0.95rem; color:#fff; margin-bottom:6px;">${title}</div>` : ''}
            ${text ? `<div style="font-size:0.85rem; color:#cbd5e1; line-height:1.55; white-space:pre-line;">${text}</div>` : ''}
            ${mediaHtml}
        </div>
        `;
    }

    function executeShareTo(platform) {
        const { title, text, url } = currentSharePayload;
        const encodedText = encodeURIComponent(`${text}\n\n${url}`);
        const encodedUrl = encodeURIComponent(url);

        // NAPRAWA: udostępnianie było w 100% bezstanowe — otwierało panel,
        // ale nigdzie nie zapisywało faktu, że do udostępnienia doszło.
        // To zapisuje realne zdarzenie, potrzebne m.in. pod odznakę "Ambasador".
        if (platform !== 'native' && typeof window.recordShareEvent === 'function') {
            window.recordShareEvent({ platform, url, title });
        }

        switch (platform) {
            case 'lumina':
                if (typeof window.shareToLumina === 'function') {
                    window.shareToLumina({
                        title: title,
                        text: text,
                        url: url,
                        imageUrl: (currentSharePayload.post && currentSharePayload.post.image) || currentSharePayload.image || '',
                        videoUrl: (currentSharePayload.post && (currentSharePayload.post.videoUrl || currentSharePayload.post.youtubeUrl)) || currentSharePayload.videoUrl || ''
                    });
                } else {
                    const sp = new URLSearchParams();
                    if (title) sp.set('share_title', title);
                    if (text) sp.set('share_text', text);
                    if (url) sp.set('share_url', url);
                    window.location.href = 'lumina-tablica.html?' + sp.toString();
                }
                closeShareModal();
                break;
            case 'whatsapp':
                window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
                break;
            case 'telegram':
                window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`, '_blank');
                break;
            case 'sms':
                window.location.href = `sms:?body=${encodedText}`;
                break;
            case 'native':
                if (navigator.share) {
                    navigator.share({ title, text, url }).then(() => {
                        if (typeof window.recordShareEvent === 'function') {
                            window.recordShareEvent({ platform: 'native', url, title });
                        }
                        if (typeof showToast === 'function') showToast('Dziękujemy za udostępnienie! ✨🕊️');
                    }).catch(() => {});
                } else {
                    copyShareModalUrl();
                }
                break;
        }
    }

    function copyShareModalUrl() {
        const url = currentSharePayload.url || window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            if (typeof showToast === 'function') {
                showToast('Link skopiowany do schowka! 🔗✨');
            } else {
                alert('Link skopiowany do schowka!');
            }
        }).catch(() => {
            prompt('Skopiuj link:', url);
        });
    }

    function openShareLuminaModal() {
        openShareModal({
            heading: 'Poleć Portal LUMINA 🕊️✨',
            title: 'LUMINA • Chrześcijańska Społeczność',
            text: 'Cześć! Chcę polecić Ci chrześcijański portal społecznościowy LUMINA – piękną przestrzeń wartościowych relacji, wiary i inspiracji. 🕊️✨',
            url: window.location.origin + '/lumina.html'
        });
    }

    function sharePostLink(postId, postData = {}) {
        const origin = window.location.origin || 'https://polskieradio.cc';
        const url = `${origin}/tablica?post=${encodeURIComponent(postId)}#${encodeURIComponent(postId)}`;
        let resolvedPost = postData && postData.id ? { ...postData } : null;

        // Auto-resolve post from feed or DOM if not passed
        if (!resolvedPost) {
            try {
                if (typeof window.getUserFeedPosts === 'function') {
                    const all = window.getUserFeedPosts();
                    resolvedPost = all.find(p => p && p.id === postId);
                }
                if (!resolvedPost && window._luminaDailyReflection && window._luminaDailyReflection.id === postId) {
                    resolvedPost = window._luminaDailyReflection;
                }
            } catch(e) {}
        }

        if (!resolvedPost) {
            const postEl = document.getElementById(postId) || document.querySelector(`[data-post-id="${postId}"]`);
            if (postEl) {
                const authorEl = postEl.querySelector('.post-author-name') || postEl.querySelector('.author-name') || postEl.querySelector('.post-author') || postEl.querySelector('h4');
                const textEl = postEl.querySelector('.post-desc-text') || postEl.querySelector('.post-text') || postEl.querySelector('.post-content') || postEl.querySelector('p');
                const titleEl = postEl.querySelector('.post-headline') || postEl.querySelector('.post-title');
                const avatarEl = postEl.querySelector('.post-author-img') || postEl.querySelector('.post-avatar');
                const imgEl = postEl.querySelector('.media-container-1x1 img') || postEl.querySelector('.post-image');

                resolvedPost = {
                    id: postId,
                    author: authorEl ? authorEl.textContent.trim().replace(/\s+NA ŻYWO.*/i, '').replace(/[\r\n]+/g, ' ') : 'Członek Społeczności',
                    authorAvatar: avatarEl ? avatarEl.src : 'lumina_icon.jpg',
                    title: titleEl ? titleEl.textContent.trim() : '',
                    text: textEl ? textEl.textContent.trim() : '',
                    image: imgEl ? imgEl.src : null,
                    url: url
                };
            }
        }

        if (!resolvedPost) {
            resolvedPost = {
                id: postId,
                author: 'Członek Społeczności',
                authorAvatar: 'lumina_icon.jpg',
                title: '',
                text: '',
                url: url
            };
        } else if (!resolvedPost.url) {
            resolvedPost.url = url;
        }

        const author = resolvedPost.author || 'Członek Społeczności';
        const title = resolvedPost.title || `Wpis autora ${author} w portalu LUMINA`;
        const snippet = resolvedPost.text ? (resolvedPost.text.length > 120 ? resolvedPost.text.substring(0, 120) + '...' : resolvedPost.text) : 'Przeczytaj ten budujący wpis na Tablicy Społeczności LUMINA.';

        openShareModal({
            heading: 'Udostępnij Wpis 💬✨',
            title: title,
            text: `„${snippet}” – ${author} w portalu LUMINA 🕊️`,
            url: url,
            post: resolvedPost
        });
    }

    function openShareProfileModal(profile = {}) {
        const name = profile.name || 'Profil w portalu LUMINA';
        const url = profile.url || window.location.href;

        openShareModal({
            heading: `Poleć profil: ${name} ✨`,
            title: `Profil ${name} w portalu LUMINA`,
            text: `Zobacz profil ${name} w chrześcijańskiej społeczności LUMINA! 🕊️`,
            url: url
        });
    }

    // ── Universal Post Share Dock (8 Canonical Icons) ──
    function buildPostShareDockHtml(item) {
        if (!item || !item.id) return '';
        const id = item.id;
        window._luminaSharedPostsCache = window._luminaSharedPostsCache || {};
        window._luminaSharedPostsCache[id] = item;
        return `
            <div class="post-share-dock" id="postShareDock_${id}" data-share-post-id="${id}">
                <div class="post-share-dock-inner">
                    <span class="post-share-dock-label"><i class="fa-solid fa-share-nodes"></i> Udostępnij wpis:</span>
                    <div class="post-share-dock-actions">
                        <button type="button" class="post-share-btn share-lumina" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'lumina') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Udostępnij w LUMINA (Repost na Twoim profilu)" aria-label="Udostępnij w LUMINA"><span class="glyph-l">L</span></button>
                        <button type="button" class="post-share-btn share-wa" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'whatsapp') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Udostępnij na WhatsApp" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></button>
                        <button type="button" class="post-share-btn share-fb" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'facebook') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Udostępnij na Facebooku" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></button>
                        <button type="button" class="post-share-btn share-tg" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'telegram') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Udostępnij na Telegramie" aria-label="Telegram"><i class="fa-brands fa-telegram"></i></button>
                        <button type="button" class="post-share-btn share-x" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'twitter') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Udostępnij na X (Twitter)" aria-label="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></button>
                        <button type="button" class="post-share-btn share-mail" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'email') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Wyślij e-mail" aria-label="E-mail"><i class="fa-regular fa-envelope"></i></button>
                        <button type="button" class="post-share-btn share-copy" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'copy') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Kopiuj link do wpisu" aria-label="Kopiuj link"><i class="fa-solid fa-link"></i></button>
                        <button type="button" class="post-share-btn share-more" onclick="window.sharePostDirect ? window.sharePostDirect('${id}', 'more') : (window.sharePostLink ? window.sharePostLink('${id}') : null)" title="Więcej opcji udostępniania…" aria-label="Więcej aplikacji"><i class="fa-solid fa-share-nodes"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    async function sharePostDirect(postId, platform = 'more', postData = null) {
        let resolvedPost = postData && postData.id ? { ...postData } : null;

        if (!resolvedPost && window._luminaSharedPostsCache && window._luminaSharedPostsCache[postId]) {
            resolvedPost = { ...window._luminaSharedPostsCache[postId] };
        }

        if (!resolvedPost) {
            try {
                if (typeof window.getUserFeedPosts === 'function') {
                    const all = window.getUserFeedPosts();
                    resolvedPost = all.find(p => p && p.id === postId);
                }
                if (!resolvedPost && window._luminaDailyReflection && window._luminaDailyReflection.id === postId) {
                    resolvedPost = window._luminaDailyReflection;
                }
                if (!resolvedPost && postId === 'post_sunday_mission_appeal') {
                    resolvedPost = {
                        id: 'post_sunday_mission_appeal',
                        author: 'Christian Culture',
                        authorAvatar: 'avatar_cezary_official.jpg',
                        title: '🌿 APEL MISYJNY CHRISTIAN CULTURE',
                        text: 'Razem budujemy Christian Culture 🌿🤍 Dzisiejsza niedziela to czas wdzięczności za wspólnotę. Wspieraj Bożą misję!',
                        image: 'apel_misyjny_cc.webp'
                    };
                }
            } catch(e) {}
        }

        const origin = window.location.origin || 'https://polskieradio.cc';
        const directPostUrl = `${origin}/tablica?post=${postId ? encodeURIComponent(postId) : ''}#${postId ? encodeURIComponent(postId) : ''}`;

        if (!resolvedPost) {
            const postEl = document.getElementById(postId) || document.querySelector(`[data-post-id="${postId}"]`);
            if (postEl) {
                const authorEl = postEl.querySelector('.post-author-name') || postEl.querySelector('.author-name') || postEl.querySelector('.post-author') || postEl.querySelector('h4');
                const textEl = postEl.querySelector('.post-desc-text') || postEl.querySelector('.post-text') || postEl.querySelector('.post-content') || postEl.querySelector('p');
                const titleEl = postEl.querySelector('.post-headline') || postEl.querySelector('.post-title');
                const avatarEl = postEl.querySelector('.post-author-img') || postEl.querySelector('.post-avatar');
                const imgEl = postEl.querySelector('.media-container-1x1 img') || postEl.querySelector('.post-image') || postEl.querySelector('img.campaign-img-full') || postEl.querySelector('img.media-img-1x1') || postEl.querySelector('article img');
                const videoEl = postEl.querySelector('video') || postEl.querySelector('iframe');

                resolvedPost = {
                    id: postId,
                    author: authorEl ? authorEl.textContent.trim().replace(/\s+NA ŻYWO.*/i, '').replace(/[\r\n]+/g, ' ') : 'Członek Społeczności',
                    authorAvatar: avatarEl ? avatarEl.src : 'lumina_icon.jpg',
                    title: titleEl ? titleEl.textContent.trim() : '',
                    text: textEl ? textEl.textContent.trim() : '',
                    image: imgEl ? imgEl.src : null,
                    videoUrl: videoEl ? (videoEl.src || null) : null,
                    url: directPostUrl
                };
            }
        }

        if (!resolvedPost) {
            resolvedPost = {
                id: postId,
                author: 'Członek Społeczności',
                authorAvatar: 'lumina_icon.jpg',
                title: '',
                text: '',
                url: directPostUrl
            };
        }

        // ── Pełna ekstrakcja treści i multimediów (brak sztucznego obcinania do 140 znaków) ──
        const title = (resolvedPost.title || '').trim();
        const author = (resolvedPost.author || resolvedPost.authorName || 'Członek Społeczności').trim();

        let fullCleanText = (resolvedPost.contentWeb || resolvedPost.fullText || resolvedPost.text || resolvedPost.desc || resolvedPost.teaser || '').trim();
        fullCleanText = fullCleanText.replace(/<br\s*\/?>/gi, '\n')
                                     .replace(/<\/p>/gi, '\n\n')
                                     .replace(/<[^>]+>/g, '')
                                     .replace(/&nbsp;/g, ' ')
                                     .replace(/&amp;/g, '&')
                                     .replace(/&quot;/g, '"')
                                     .trim();

        let postImageUrl = resolvedPost.image || resolvedPost.imageUrl || '';
        if (postImageUrl && !postImageUrl.startsWith('http')) {
            postImageUrl = origin + '/' + postImageUrl.replace(/^\//, '');
        }

        let postVideoUrl = resolvedPost.videoUrl || resolvedPost.youtubeUrl || resolvedPost.playlistUrl || '';
        if (postVideoUrl && !postVideoUrl.startsWith('http')) {
            postVideoUrl = origin + '/' + postVideoUrl.replace(/^\//, '');
        }

        // Dynamiczny URL Cloudflare Edge na polskieradio.cc – zapewnia pełny podgląd Open Graph ze zdjęciem posta (nie ogólną ikoną)
        const sp = new URLSearchParams();
        if (postId) sp.set('post', postId);
        if (title) sp.set('title', title);
        if (author) sp.set('author', author);
        if (fullCleanText) sp.set('text', fullCleanText.length > 300 ? (fullCleanText.substring(0, 300) + '…') : fullCleanText);
        if (postImageUrl) sp.set('img', postImageUrl);
        if (postVideoUrl) sp.set('video', postVideoUrl);
        const dynamicShareUrl = `${origin}/tablica?${sp.toString()}`;

        if (typeof window.recordShareEvent === 'function') {
            window.recordShareEvent({ platform, url: dynamicShareUrl, title });
        }

        switch (platform) {
            case 'lumina':
            case 'repost':
                currentSharePayload = {
                    title: title,
                    text: fullCleanText,
                    url: directPostUrl,
                    image: postImageUrl,
                    videoUrl: postVideoUrl,
                    post: resolvedPost
                };
                openShareModal({
                    heading: 'Udostępnij Wpis w LUMINA 🕊️',
                    title: title || `Wpis autora ${author}`,
                    text: fullCleanText,
                    url: directPostUrl,
                    post: resolvedPost
                });
                if (typeof openLuminaRepostComposer === 'function') {
                    openLuminaRepostComposer();
                }
                break;

            case 'whatsapp': {
                let waText = '';
                if (title) waText += `🌟 *${title}*\n`;
                if (author) waText += `👤 *Autor:* ${author}\n\n`;
                if (fullCleanText) waText += `${fullCleanText}\n\n`;
                if (postVideoUrl) waText += `🎬 *Wideo do wpisu:* ${postVideoUrl}\n\n`;
                else if (postImageUrl) waText += `📸 *Zdjęcie / Multimedia:* ${postImageUrl}\n\n`;
                waText += `🕊️ *Wpis w Społeczności LUMINA:*\n${dynamicShareUrl}`;

                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
                break;
            }

            case 'facebook': {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dynamicShareUrl)}`, '_blank');
                break;
            }

            case 'telegram': {
                let tgText = '';
                if (title) tgText += `🌟 ${title}\n\n`;
                if (fullCleanText) tgText += (fullCleanText.length > 500 ? fullCleanText.substring(0, 500) + '…\n\n' : `${fullCleanText}\n\n`);
                if (postImageUrl) tgText += `📸 ${postImageUrl}\n\n`;
                window.open(`https://t.me/share/url?url=${encodeURIComponent(dynamicShareUrl)}&text=${encodeURIComponent(tgText)}`, '_blank');
                break;
            }

            case 'twitter':
            case 'x': {
                let twText = title ? `🌟 ${title}\n` : '';
                const twRemain = 180 - twText.length;
                if (twRemain > 20 && fullCleanText) {
                    twText += (fullCleanText.length > twRemain ? fullCleanText.substring(0, twRemain) + '…' : fullCleanText);
                }
                window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(dynamicShareUrl)}&text=${encodeURIComponent(twText)}`, '_blank');
                break;
            }

            case 'email':
            case 'mail': {
                const subject = title ? `${title} • LUMINA Christian Culture` : `Wpis w portalu LUMINA`;
                let mailBody = (title ? `${title}\n` : '')
                    + (author ? `Autor: ${author}\n\n` : '')
                    + (fullCleanText ? `${fullCleanText}\n\n` : '')
                    + (postImageUrl ? `Zdjęcie do wpisu: ${postImageUrl}\n\n` : '')
                    + (postVideoUrl ? `Wideo: ${postVideoUrl}\n\n` : '')
                    + `Otwórz wpis w portalu LUMINA:\n${dynamicShareUrl}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
                break;
            }

            case 'copy': {
                const cleanPostUrl = `${origin}/tablica?post=${encodeURIComponent(postId || '')}`;
                const copyText = (title ? `${title}\n\n` : '')
                    + (fullCleanText ? `${fullCleanText}\n\n` : '')
                    + (postImageUrl ? `Zdjęcie: ${postImageUrl}\n\n` : '')
                    + `Link do wpisu w LUMINA:\n${cleanPostUrl}`;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(copyText).then(() => {
                        if (typeof window.showToast === 'function') {
                            window.showToast('Treść wpisu wraz z multimediami i linkiem skopiowana! 🔗✨');
                        } else {
                            alert('Treść wpisu skopiowana do schowka!');
                        }
                    }).catch(() => {
                        prompt('Skopiuj link do wpisu:', cleanPostUrl);
                    });
                } else {
                    prompt('Skopiuj link do wpisu:', cleanPostUrl);
                }
                break;
            }

            case 'more':
            default: {
                if (navigator.share) {
                    const shareTitle = title || `Wpis autora ${author} w portalu LUMINA`;
                    const shareTextBody = (title ? `🌟 ${title}\n` : '')
                        + (author ? `👤 Autor: ${author}\n\n` : '')
                        + (fullCleanText ? `${fullCleanText}\n\n` : '')
                        + `🕊️ Zobacz w LUMINA: ${dynamicShareUrl}`;

                    let fileToShare = null;
                    if (postImageUrl && window.fetch) {
                        try {
                            const imgRes = await fetch(postImageUrl, { mode: 'cors' });
                            if (imgRes.ok) {
                                const blob = await imgRes.blob();
                                const mime = blob.type || 'image/jpeg';
                                const ext = mime.includes('png') ? 'png' : (mime.includes('webp') ? 'webp' : 'jpg');
                                const f = new File([blob], `wpis_lumina_${resolvedPost.id || 'foto'}.${ext}`, { type: mime });
                                if (navigator.canShare && navigator.canShare({ files: [f] })) {
                                    fileToShare = f;
                                }
                            }
                        } catch (e) {
                            console.warn('[Lumina Share] Image fetch skipped:', e);
                        }
                    }

                    if (fileToShare) {
                        navigator.share({
                            title: shareTitle,
                            text: shareTextBody,
                            files: [fileToShare]
                        }).then(() => {
                            if (typeof window.showToast === 'function') window.showToast('Wpis ze zdjęciem został pomyślnie udostępniony! ✨🕊️');
                        }).catch((err) => {
                            if (err.name !== 'AbortError') {
                                navigator.share({ title: shareTitle, text: shareTextBody, url: dynamicShareUrl }).catch(()=>{});
                            }
                        });
                    } else {
                        navigator.share({
                            title: shareTitle,
                            text: shareTextBody,
                            url: dynamicShareUrl
                        }).then(() => {
                            if (typeof window.showToast === 'function') window.showToast('Dziękujemy za udostępnienie! ✨🕊️');
                        }).catch(() => {});
                    }
                } else {
                    openShareModal({
                        heading: 'Udostępnij Wpis 💬✨',
                        title: title || 'Wpis w portalu LUMINA',
                        text: fullCleanText || 'Zobacz ten budujący wpis na Tablicy Społeczności LUMINA.',
                        url: dynamicShareUrl,
                        post: resolvedPost
                    });
                }
                break;
            }
        }
    }

    // ── Web Push Notifications ──
    async function requestLuminaPushNotifications() {
        dismissPushToast();
        if (!('Notification' in window)) {
            if (typeof showToast === 'function') showToast('Powiadomienia nie są wspierane w tej przeglądarce.');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                localStorage.setItem('lumina_push_enabled', 'true');
                if (typeof showToast === 'function') {
                    showToast('🔔 Powiadomienia Web Push zostały pomyślnie włączone!');
                }
                
                // Show instant welcome notification if service worker is active
                if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                    navigator.serviceWorker.ready.then((registration) => {
                        registration.showNotification('Witaj w Społeczności LUMINA! 🕊️', {
                            body: 'Powiadomienia są aktywne. Będziesz na bieżąco z nowymi wiadomościami i modlitwami.',
                            icon: 'lumina-icon-192.png',
                            badge: 'lumina-icon-192.png'
                        });
                    });
                }
            } else {
                localStorage.setItem('lumina_push_enabled', 'false');
                if (typeof showToast === 'function') showToast('Powiadomienia zostały wyłączone.');
            }
        } catch (e) {
            console.warn('Error requesting push permission:', e);
        }
    }

    function dismissPushToast() {
        const toast = document.getElementById('luminaPushToastPrompt');
        if (toast) toast.classList.remove('active');
        sessionStorage.setItem('lumina_push_prompt_dismissed', 'true');
    }

    function checkPushPrompt() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted' || Notification.permission === 'denied') return;
        if (sessionStorage.getItem('lumina_push_prompt_dismissed') === 'true') return;

        setTimeout(() => {
            const toast = document.getElementById('luminaPushToastPrompt');
            if (toast) toast.classList.add('active');
        }, 5000); // show prompt gently after 5 seconds
    }

    // ── Global API Exposure ──
    window.openShareModal = openShareModal;
    window.closeShareModal = closeShareModal;
    window.executeShareTo = executeShareTo;
    window.copyShareModalUrl = copyShareModalUrl;
    window.openShareLuminaModal = openShareLuminaModal;
    window.sharePostLink = sharePostLink;
    window.sharePostDirect = sharePostDirect;
    window.buildPostShareDockHtml = buildPostShareDockHtml;
    window.openShareProfileModal = openShareProfileModal;
    window.openLuminaRepostComposer = openLuminaRepostComposer;
    window.backToShareMainView = backToShareMainView;
    window.submitLuminaRepost = submitLuminaRepost;
    window.buildQuotedPostHtml = buildQuotedPostHtml;
    window.requestLuminaPushNotifications = requestLuminaPushNotifications;
    window.dismissPushToast = dismissPushToast;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectSharingStyles();
            createSharingModalDOM();
            checkPushPrompt();
        });
    } else {
        injectSharingStyles();
        createSharingModalDOM();
        checkPushPrompt();
    }

})();
