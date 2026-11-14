import fs from 'fs';
import path from 'path';

const shortsPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/lumina-shorts.html';
const rolkiPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/rolki.html';

let content = fs.readFileSync(shortsPath, 'utf8');

// 1. Remove duplicate handleSlideTap around line 2415 if present
const oldTapPattern = /\/\/\s*──\s*Tap to Play\/Pause\s*──\r?\n\s*window\.handleSlideTap\s*=\s*function\(slideEl\)\s*\{[\s\S]*?\};\r?\n/;
if (oldTapPattern.test(content)) {
    content = content.replace(oldTapPattern, '// (Duplicate handleSlideTap removed - see AudioDirector integrated version below)\n');
    console.log('1. Removed duplicate handleSlideTap');
} else {
    console.log('1. Duplicate handleSlideTap already removed or not found');
}

// 2. Header CSS
const oldHeaderCss = /\.shorts-header\s*\{[\s\S]*?\.header-right-cluster\s*\{[\s\S]*?flex-shrink:\s*0;\r?\n\s*\}/;
const newHeaderCss = `.shorts-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 60px;
            padding: 10px 12px;
            padding-top: max(10px, env(safe-area-inset-top));
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            z-index: 50;
            background: linear-gradient(180deg, rgba(3, 7, 18, 0.95) 0%, rgba(3, 7, 18, 0.75) 70%, transparent 100%);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            pointer-events: auto;
            box-sizing: border-box;
        }

        .header-left-cluster {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex-shrink: 0;
        }

        .header-more-group {
            display: flex;
            align-items: center;
            gap: 5px;
            position: relative;
            flex-shrink: 0;
        }

        .header-right-cluster {
            display: flex;
            align-items: center;
            gap: 5px;
            flex-shrink: 0;
            opacity: 0;
            max-width: 0;
            overflow: hidden;
            pointer-events: none;
            transform: translateX(18px) scale(0.95);
            transition: max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.22s ease,
                        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            white-space: nowrap;
        }

        .header-more-group.drawer-open .header-right-cluster {
            opacity: 1;
            max-width: 340px;
            overflow: visible;
            pointer-events: auto;
            transform: translateX(0) scale(1);
        }

        .header-more-toggle-btn {
            border-color: rgba(250, 204, 21, 0.45);
        }

        .header-more-group.drawer-open .header-more-toggle-btn {
            background: rgba(212, 169, 74, 0.28);
            border-color: var(--gold);
            color: var(--gold);
            box-shadow: 0 0 14px rgba(250, 204, 21, 0.4);
        }`;

if (oldHeaderCss.test(content)) {
    content = content.replace(oldHeaderCss, newHeaderCss);
    console.log('2. Updated Header CSS');
} else {
    console.log('2. oldHeaderCss pattern did not match');
}

// 3. YouTube iframe top crop
const oldYtCss = /\.video-container\s+iframe\.youtube-shorts-iframe\s*\{\s*position:\s*absolute;\s*top:\s*0;/;
const newYtCss = `.video-container iframe.youtube-shorts-iframe {
            position: absolute;
            top: -46px;
            left: 0;
            width: 100%;
            height: calc(100% + 50px);`;
if (oldYtCss.test(content)) {
    content = content.replace(oldYtCss, newYtCss);
    console.log('3. Updated YouTube iframe top crop CSS');
} else {
    console.log('3. YouTube iframe CSS pattern not matched');
}

// 4. Action Sidebar CSS
const oldSidebarCss = /\/\* Right Action Bar \(TikTok\/Reels Style\) \*\/\s*\.action-sidebar\s*\{[\s\S]*?pointer-events:\s*auto;\r?\n\s*\}/;
const newSidebarCss = `/* Right Action Bar (TikTok/Reels Style) */
        .action-sidebar {
            position: absolute;
            right: 12px;
            bottom: 84px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            z-index: 40;
            pointer-events: auto;
        }

        /* Collapsible vertical action items drawer */
        .action-items-drawer {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            max-height: 0;
            opacity: 0;
            overflow: hidden;
            pointer-events: none;
            transform: translateX(50px) scale(0.92);
            transition: max-height 0.38s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.25s ease,
                        transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .shorts-app-shell.vertical-actions-open .action-items-drawer {
            max-height: 560px;
            opacity: 1;
            overflow: visible;
            pointer-events: auto;
            transform: translateX(0) scale(1);
        }

        .vertical-more-toggle-btn {
            border-color: rgba(250, 204, 21, 0.45);
            background: rgba(15, 23, 42, 0.85);
        }

        .shorts-app-shell.vertical-actions-open .vertical-more-toggle-btn {
            background: rgba(212, 169, 74, 0.28);
            border-color: var(--gold);
            color: var(--gold);
            box-shadow: 0 0 16px rgba(250, 204, 21, 0.45);
        }`;
if (oldSidebarCss.test(content)) {
    content = content.replace(oldSidebarCss, newSidebarCss);
    console.log('4. Updated Action Sidebar CSS');
} else {
    console.log('4. Action Sidebar CSS pattern not matched');
}

// 5. Header HTML
const oldHeaderHtml = /<header class="shorts-header">[\s\S]*?<\/header>/;
const newHeaderHtml = `<header class="shorts-header">
            <div class="header-left-cluster">
                <a href="/tablica" class="header-btn" title="Powrót do Tablicy Społeczności" aria-label="Wróć do Tablicy">
                    <i class="fa-solid fa-arrow-left"></i>
                </a>
                <div class="header-title-box">
                    <span class="header-title">Rolki</span>
                    <span class="header-badge">9:16</span>
                </div>
            </div>

            <!-- Dedykowana grupa pozioma z przyciskiem Więcej -->
            <div class="header-more-group" id="headerMoreGroup">
                <div class="header-right-cluster" id="headerHorizontalDrawer" aria-hidden="true">
                    <button type="button" class="header-btn" id="randomReelBtn" onclick="jumpToRandomReel()" title="Wylosuj inną rolkę (tryb nieprzewidywalny)" aria-label="Losuj rolkę">
                        <i class="fa-solid fa-shuffle" id="randomReelIcon" style="color:#facc15;"></i>
                    </button>

                    <button type="button" class="header-btn" id="autoAdvanceBtn" onclick="toggleAutoAdvance()" title="Automatyczne przejście do kolejnej rolki: WŁ" aria-label="Autoodtwarzanie">
                        <i class="fa-solid fa-forward-step" id="autoAdvanceIcon" style="color:#38bdf8;"></i>
                    </button>

                    <button type="button" class="header-btn header-add-btn" id="openAddReelBtn" onclick="openPublishModal()" title="Opublikuj Rolkę z YouTube, TikTok, IG, FB, MP4" aria-label="Dodaj Rolkę">
                        <i class="fa-solid fa-plus"></i>
                    </button>

                    <button type="button" class="header-btn" id="globalMuteBtn" onclick="toggleGlobalMute()" title="Włącz / Wyłącz dźwięk" aria-label="Przełącz dźwięk">
                        <i class="fa-solid fa-volume-high" id="globalMuteIcon" style="color:#facc15;"></i>
                    </button>
                </div>

                <!-- Dedykowany przycisk ikona Więcej dla paska poziomego -->
                <button type="button" class="header-btn header-more-toggle-btn" id="headerMoreToggleBtn" onclick="toggleHeaderActionsDrawer(event)" title="Więcej narzędzi (rozsuń / schowaj)" aria-label="Więcej narzędzi" aria-expanded="false">
                    <i class="fa-solid fa-ellipsis" id="headerMoreIcon"></i>
                </button>
            </div>
        </header>`;
if (oldHeaderHtml.test(content)) {
    content = content.replace(oldHeaderHtml, newHeaderHtml);
    console.log('5. Updated Header HTML');
} else {
    console.log('5. Header HTML pattern not matched');
}

// 6. YouTube Embed URL (controls=0)
const oldYtEmbed = /controls=1&playsinline=1/;
if (oldYtEmbed.test(content)) {
    content = content.replace(oldYtEmbed, 'controls=0&playsinline=1&iv_load_policy=3');
    console.log('6. Updated YouTube Embed URL controls=0');
} else {
    console.log('6. YouTube Embed URL controls=1 not found');
}

// 7. Slide Action Sidebar HTML (wrap items + add vertical more button)
const oldSlideSidebar = /<!-- Right Action Sidebar -->\s*<div class="action-sidebar">([\s\S]*?)<\/div>\s*<!-- Bottom Info Overlay -->/;
if (oldSlideSidebar.test(content)) {
    const match = content.match(oldSlideSidebar);
    const innerItems = match[1];
    const newSlideSidebar = `<!-- Right Action Sidebar -->
                <div class="action-sidebar">
                    <!-- Collapsible Vertical Action Items -->
                    <div class="action-items-drawer">
${innerItems}
                    </div>

                    <!-- Dedykowany przycisk ikona Więcej dla paska pionowego -->
                    <div class="action-btn-wrapper vertical-more-wrapper">
                        <button type="button"
                                class="action-circle-btn vertical-more-toggle-btn"
                                onclick="toggleVerticalActionsDrawer(event)"
                                title="Więcej akcji (wysuń / schowaj)"
                                aria-label="Więcej akcji"
                                aria-expanded="false">
                            <i class="fa-solid fa-ellipsis-vertical vertical-more-icon"></i>
                        </button>
                        <span class="action-label vertical-more-label">Więcej</span>
                    </div>
                </div>

                <!-- Bottom Info Overlay -->`;
    content = content.replace(oldSlideSidebar, newSlideSidebar);
    console.log('7. Updated Slide Action Sidebar HTML with Collapsible Drawer and Więcej Button');
} else {
    console.log('7. Slide Action Sidebar pattern not matched');
}

// 8. JS Toggle Handlers & handleSlideTap
const oldTapFunc = /\/\/\s*──\s*Kliknięcie \/ Tap w rolkę\s*──\s*window\.handleSlideTap\s*=\s*function\(slideEl\)\s*\{[\s\S]*?showShortsToast\(isGlobalMuted \? '🔇 Wyciszono dźwięk' : '🔊 Dźwięk włączony \(DSP Master\)'\);\s*\};/;

const newJsBlocks = `// ── Pasek Poziomy (Header Actions Drawer) ──
        window.toggleHeaderActionsDrawer = function(e) {
            if (e) {
                e.stopPropagation();
            }
            const group = document.getElementById('headerMoreGroup');
            const btn = document.getElementById('headerMoreToggleBtn');
            const icon = document.getElementById('headerMoreIcon');
            if (!group) return;

            const isOpen = group.classList.toggle('drawer-open');
            if (btn) {
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
            if (icon) {
                icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-ellipsis';
            }
        };

        // ── Pasek Pionowy (Vertical Actions Drawer) ──
        window.toggleVerticalActionsDrawer = function(e) {
            if (e) {
                e.stopPropagation();
            }
            const shell = document.getElementById('shortsShell');
            if (!shell) return;
            const isOpen = shell.classList.toggle('vertical-actions-open');

            const moreBtns = document.querySelectorAll('.vertical-more-toggle-btn');
            const moreLabels = document.querySelectorAll('.vertical-more-label');

            moreBtns.forEach(btn => {
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                const icon = btn.querySelector('.vertical-more-icon');
                if (icon) {
                    icon.className = isOpen ? 'fa-solid fa-xmark vertical-more-icon' : 'fa-solid fa-ellipsis-vertical vertical-more-icon';
                }
            });

            moreLabels.forEach(lbl => {
                lbl.textContent = isOpen ? 'Zwiń' : 'Więcej';
            });
        };

        // Zamknięcie paska poziomego po kliknięciu poza niego
        document.addEventListener('click', function(e) {
            const headerGroup = document.getElementById('headerMoreGroup');
            if (headerGroup && headerGroup.classList.contains('drawer-open')) {
                if (!headerGroup.contains(e.target)) {
                    window.toggleHeaderActionsDrawer();
                }
            }
        });

        // ── Kliknięcie / Tap w rolkę ──
        window.handleSlideTap = function(slideEl) {
            if (!slideEl) return;

            // Jeśli pasek poziomy był rozwinięty, zwiń go przy tapnięciu w rolkę
            const headerGroup = document.getElementById('headerMoreGroup');
            if (headerGroup && headerGroup.classList.contains('drawer-open')) {
                window.toggleHeaderActionsDrawer();
                return;
            }

            const video = slideEl.querySelector('video');
            const iframe = slideEl.querySelector('iframe.live-channel-iframe');
            const ytIframe = slideEl.querySelector('iframe:not(.live-channel-iframe)');
            const indicator = slideEl.querySelector('.play-indicator-overlay');

            if (window.AudioDirector) {
                window.AudioDirector.unlockAudio();
            }

            if (iframe) {
                if (window.AudioDirector) {
                    window.AudioDirector.acquireFocus(slideEl.id, 'live_iframe', iframe);
                } else {
                    triggerLiveChannelAutoplay(iframe, true);
                }
                if (indicator) {
                    indicator.innerHTML = '<i class="fa-solid fa-play"></i>';
                    indicator.classList.add('show');
                    setTimeout(() => indicator.classList.remove('show'), 500);
                }
                return;
            }

            if (video) {
                if (video.paused) {
                    if (window.AudioDirector) {
                        window.AudioDirector.acquireFocus(slideEl.id, 'video', video);
                    } else {
                        video.play().catch(() => {});
                    }
                    if (indicator) {
                        indicator.innerHTML = '<i class="fa-solid fa-play"></i>';
                        indicator.classList.add('show');
                        setTimeout(() => indicator.classList.remove('show'), 500);
                    }
                } else {
                    if (window.AudioDirector) {
                        window.AudioDirector._silenceSource({ id: slideEl.id, type: 'video', element: video });
                    } else {
                        video.pause();
                    }
                    if (indicator) {
                        indicator.innerHTML = '<i class="fa-solid fa-pause"></i>';
                        indicator.classList.add('show');
                        setTimeout(() => indicator.classList.remove('show'), 500);
                    }
                }
            } else if (ytIframe) {
                if (slideEl._ytPaused) {
                    ytIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
                    slideEl._ytPaused = false;
                    if (window.AudioDirector) {
                        window.AudioDirector.acquireFocus(slideEl.id, 'youtube', ytIframe);
                    }
                    if (indicator) {
                        indicator.innerHTML = '<i class="fa-solid fa-play"></i>';
                        indicator.classList.add('show');
                        setTimeout(() => indicator.classList.remove('show'), 500);
                    }
                } else {
                    ytIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
                    slideEl._ytPaused = true;
                    if (indicator) {
                        indicator.innerHTML = '<i class="fa-solid fa-pause"></i>';
                        indicator.classList.add('show');
                        setTimeout(() => indicator.classList.remove('show'), 500);
                    }
                }
            }
        };

        // ── Wyciszenie Globalne ──
        window.toggleGlobalMute = function() {
            if (window.AudioDirector) {
                isGlobalMuted = window.AudioDirector.toggleMasterMute();
            } else {
                isGlobalMuted = !isGlobalMuted;
                const icon = document.getElementById('globalMuteIcon');
                if (icon) {
                    icon.className = isGlobalMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
                    icon.style.color = isGlobalMuted ? '#fff' : '#facc15';
                }
                document.querySelectorAll('.short-slide video').forEach(v => {
                    v.muted = isGlobalMuted;
                });
                document.querySelectorAll('.short-slide iframe.live-channel-iframe').forEach(ifr => {
                    triggerLiveChannelAutoplay(ifr, !isGlobalMuted);
                });
            }
            showShortsToast(isGlobalMuted ? '🔇 Wyciszono dźwięk' : '🔊 Dźwięk włączony (DSP Master)');
        };`;

if (oldTapFunc.test(content)) {
    content = content.replace(oldTapFunc, newJsBlocks);
    console.log('8. Updated JS toggle handlers and handleSlideTap');
} else {
    console.log('8. oldTapFunc pattern not matched');
}

fs.writeFileSync(shortsPath, content, 'utf8');
console.log('Successfully saved lumina-shorts.html');

fs.writeFileSync(rolkiPath, content, 'utf8');
console.log('Successfully saved rolki.html');
