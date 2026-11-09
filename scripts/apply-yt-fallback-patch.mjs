import fs from 'node:fs';

const masterPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html';
let content = fs.readFileSync(masterPath, 'utf8');

// 1. CSS
const cssToAdd = `
        /* --- MCR EMERGENCY STANDBY SLATE (AWARYJNA PLANSZA Z MUZYKĄ) --- */
        #mcr-standby-slate {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, #141824 0%, #08090e 70%, #030407 100%);
            z-index: 9990;
            display: none;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.8s ease;
            overflow: hidden;
            pointer-events: none;
        }

        #mcr-standby-slate.show {
            display: flex;
            opacity: 1;
            pointer-events: auto;
        }

        .mcr-standby-vignette {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%);
            z-index: 1;
            pointer-events: none;
        }

        .mcr-standby-glass-card {
            position: relative;
            z-index: 2;
            background: rgba(12, 16, 26, 0.75);
            border: 1.5px solid rgba(212, 175, 55, 0.5);
            border-radius: 24px;
            padding: 35px 50px;
            text-align: center;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.2);
            max-width: 820px;
            width: 90%;
            animation: bumperPulse 3s infinite alternate ease-in-out;
        }

        .mcr-standby-brand {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
            font-weight: 800;
            letter-spacing: 3px;
            color: var(--gold-primary);
            text-transform: uppercase;
            margin-bottom: 15px;
        }

        .mcr-standby-live-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 14px;
            border-radius: 20px;
            background: rgba(220, 38, 38, 0.2);
            border: 1px solid rgba(220, 38, 38, 0.6);
            color: #fca5a5;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 18px;
        }

        .mcr-standby-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ef4444;
            box-shadow: 0 0 10px #ef4444;
            animation: mcrLivePulse 1.5s infinite;
        }

        @keyframes mcrLivePulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.85); }
        }

        .mcr-standby-title {
            font-family: 'Cinzel', serif;
            font-size: 2.2rem;
            font-weight: 700;
            color: #ffffff;
            margin: 0 0 12px 0;
            letter-spacing: 2px;
            text-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
        }

        .mcr-standby-desc {
            font-size: 1.05rem;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.88);
            margin: 0 auto 24px auto;
            max-width: 650px;
        }

        .mcr-standby-equalizer {
            display: flex;
            align-items: flex-end;
            justify-content: center;
            gap: 6px;
            height: 36px;
            margin: 0 auto 18px auto;
        }

        .mcr-standby-equalizer span {
            width: 5px;
            background: linear-gradient(180deg, var(--gold-primary), #fff);
            border-radius: 3px;
            animation: mcrEqWave 1.2s ease-in-out infinite alternate;
        }

        .mcr-standby-equalizer span:nth-child(1) { height: 12px; animation-delay: 0.1s; }
        .mcr-standby-equalizer span:nth-child(2) { height: 24px; animation-delay: 0.3s; }
        .mcr-standby-equalizer span:nth-child(3) { height: 34px; animation-delay: 0.15s; }
        .mcr-standby-equalizer span:nth-child(4) { height: 18px; animation-delay: 0.45s; }
        .mcr-standby-equalizer span:nth-child(5) { height: 30px; animation-delay: 0.25s; }
        .mcr-standby-equalizer span:nth-child(6) { height: 22px; animation-delay: 0.35s; }
        .mcr-standby-equalizer span:nth-child(7) { height: 14px; animation-delay: 0.5s; }

        @keyframes mcrEqWave {
            0% { transform: scaleY(0.3); opacity: 0.6; }
            100% { transform: scaleY(1); opacity: 1; }
        }

        .mcr-standby-meta {
            font-size: 0.8rem;
            letter-spacing: 2px;
            color: rgba(212, 175, 55, 0.85);
            font-weight: 700;
            text-transform: uppercase;
        }
    </style>`;

if (!content.includes('mcr-standby-slate')) {
    content = content.replace('    </style>', cssToAdd);
}

// 2. HTML Markup
const htmlToAdd = `
    <!-- EMERGENCY AUDIO BACKUP STREAM -->
    <audio id="mcr-fallback-audio" preload="none" src="https://stream.zeno.fm/gn3uhltrrytuv"></audio>

    <!-- FULL-SCREEN STANDBY SLATE (AWARYJNA PLANSZA Z MUZYKĄ) -->
    <div id="mcr-standby-slate" class="mcr-standby-slate" aria-hidden="true">
        <div class="mcr-standby-vignette"></div>
        <div class="mcr-standby-glass-card">
            <div class="mcr-standby-brand">
                <i class="fa-solid fa-tv"></i> TELEWIZJA CHRISTIAN CULTURE &bull; EMISJA 24/7
            </div>
            <div class="mcr-standby-live-badge">
                <span class="mcr-standby-dot"></span> CAŁODOBOWY STRUMIEŃ MUZYCZNY
            </div>
            <h1 class="mcr-standby-title">CHWILOWA PRZERWA TECHNICZNA</h1>
            <p class="mcr-standby-desc">Trwa automatyczne wznawianie strumienia wideo. W tle nadajemy najpiękniejszą muzykę chwały i uwielbienia Christian Culture.</p>
            <div class="mcr-standby-equalizer" aria-hidden="true">
                <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="mcr-standby-meta" id="mcrStandbyMeta">CC AUDIO BACKUP ACTIVE &bull; SYNC IN PROGRESS</div>
        </div>
    </div>
`;

if (!content.includes('id="mcr-standby-slate"')) {
    const bumperEnd = '    </div>\r\n\r\n    <!-- ── GÓRNY PASEK EMISYJNY';
    const bumperEndLF = '    </div>\n\n    <!-- ── GÓRNY PASEK EMISYJNY';
    if (content.includes(bumperEnd)) {
        content = content.replace(bumperEnd, '    </div>\r\n' + htmlToAdd + '\r\n    <!-- ── GÓRNY PASEK EMISYJNY');
    } else if (content.includes(bumperEndLF)) {
        content = content.replace(bumperEndLF, '    </div>\n' + htmlToAdd + '\n    <!-- ── GÓRNY PASEK EMISYJNY');
    } else {
        throw new Error('Bumper end marker not found!');
    }
}

// 3. JavaScript logic
const jsWatchdogLogic = `
        // ── 🛡️ MCR WATCHDOG & EMERGENCY AUDIO/SLATE FALLBACK ──
        let ytErrorCount = 0;
        let ytLastErrorTime = 0;
        let ytRetryTimer = null;
        let fallbackRecoveryTimer = null;
        let isStandbyFallbackActive = false;

        function logMcrEvent(eventDescription, details = {}) {
            const now = new Date();
            const entry = {
                iso: now.toISOString(),
                localTime: now.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
                event: eventDescription,
                details: details
            };
            try {
                let logs = JSON.parse(localStorage.getItem('cc_mcr_error_log') || '[]');
                logs.push(entry);
                if (logs.length > 100) logs.shift();
                localStorage.setItem('cc_mcr_error_log', JSON.stringify(logs));
            } catch(e) {}
            console.warn(\`[MCR Watchdog \${entry.localTime}] \${eventDescription}\`, details);
        }

        function reloadActiveSubchannel() {
            const f = getActiveFrame();
            if (!f || !currentUrl) return;
            logMcrEvent('Wymuszone przeładowanie aktywnego kanału', { channel: currentUrl });
            const sep = currentUrl.includes('?') ? '&' : '?';
            const audioQuery = isMutedDefault ? 'muted=1&autoplay=1' : 'autoplay=1';
            const safeParam = isSafeMonetizationMode ? '&safe_monetization=1' : '&safe_monetization=0';
            f.src = currentUrl + sep + audioQuery + '&in_mcr=1&noticker=1' + safeParam + '&t=' + Date.now();
        }

        function activateStandbyFallback() {
            if (isStandbyFallbackActive) return;
            isStandbyFallbackActive = true;
            logMcrEvent('Uruchomienie planszy awaryjnej oraz zapasowego strumienia audio', { channel: currentUrl });
            const slate = document.getElementById('mcr-standby-slate');
            const audio = document.getElementById('mcr-fallback-audio');
            if (slate) {
                slate.classList.add('show');
                slate.setAttribute('aria-hidden', 'false');
            }
            if (audio) {
                audio.currentTime = 0;
                audio.muted = isMutedDefault;
                const p = audio.play();
                if (p !== undefined) {
                    p.catch(err => {
                        console.log('MCR fallback audio play caught:', err);
                        if (!isMutedDefault) {
                            audio.muted = true;
                            audio.play().catch(() => {});
                        }
                    });
                }
            }

            if (!fallbackRecoveryTimer) {
                fallbackRecoveryTimer = setInterval(() => {
                    if (!isStandbyFallbackActive) {
                        clearInterval(fallbackRecoveryTimer);
                        fallbackRecoveryTimer = null;
                        return;
                    }
                    logMcrEvent('Cicha próba wznowienia kanału w tle planszy awaryjnej', { channel: currentUrl });
                    reloadActiveSubchannel();
                }, 45000);
            }
        }

        function deactivateStandbyFallback() {
            if (!isStandbyFallbackActive) return;
            isStandbyFallbackActive = false;
            ytErrorCount = 0;
            if (ytRetryTimer) {
                clearTimeout(ytRetryTimer);
                ytRetryTimer = null;
            }
            if (fallbackRecoveryTimer) {
                clearInterval(fallbackRecoveryTimer);
                fallbackRecoveryTimer = null;
            }
            const slate = document.getElementById('mcr-standby-slate');
            const audio = document.getElementById('mcr-fallback-audio');
            if (slate) {
                slate.classList.remove('show');
                slate.setAttribute('aria-hidden', 'true');
            }
            if (audio) {
                audio.pause();
            }
            logMcrEvent('Program wznowiony poprawnie — wyłączenie planszy awaryjnej', { channel: currentUrl });
        }

        function handleYtPlayerError(errorCode) {
            const now = Date.now();
            logMcrEvent('Błąd odtwarzacza YouTube w podkanale', { code: errorCode, activeChannel: currentUrl });

            if (now - ytLastErrorTime < 60000) {
                ytErrorCount++;
            } else {
                ytErrorCount = 1;
            }
            ytLastErrorTime = now;

            if (ytErrorCount === 1) {
                logMcrEvent('Próba automatycznego restartu odtwarzacza po błędzie (za 3 s)', { retry: 1, channel: currentUrl });
                if (ytRetryTimer) clearTimeout(ytRetryTimer);
                ytRetryTimer = setTimeout(() => {
                    reloadActiveSubchannel();
                }, 3000);
            } else {
                logMcrEvent('Powtórzony błąd odtwarzacza YouTube — włączenie planszy awaryjnej z muzyką', { errorCount: ytErrorCount, channel: currentUrl });
                activateStandbyFallback();
            }
        }

        window.__mcrWatchdog = {
            handleYtPlayerError,
            activateStandbyFallback,
            deactivateStandbyFallback,
            reloadActiveSubchannel,
            logMcrEvent,
            getState: () => ({ ytErrorCount, isStandbyFallbackActive })
        };
`;

// Insert watchdog functions right before window.addEventListener('message'
if (!content.includes('function handleYtPlayerError')) {
    const msgMarker = "        // Listen for control & completion signals";
    content = content.replace(msgMarker, jsWatchdogLogic + '\r\n' + msgMarker);
}

// In message handler, add YT_PLAYER_ERROR and YT_PLAYER_PLAYING / READY handlers
const messageOld = "            if (type === 'APOKALIPSA_FINISHED'";
const messageNew = `            if (type === 'YT_PLAYER_ERROR') {
                const errCode = (event.data && event.data.code !== undefined) ? event.data.code : -1;
                handleYtPlayerError(errCode);
                return;
            }
            if (type === 'YT_PLAYER_PLAYING' || type === 'YT_PLAYER_READY') {
                if (isStandbyFallbackActive) {
                    deactivateStandbyFallback();
                }
                return;
            }
            if (type === 'APOKALIPSA_FINISHED'`;

if (!content.includes("type === 'YT_PLAYER_ERROR'")) {
    content = content.replace(messageOld, messageNew);
}

// In unmuteSubframe, add unmuting of fallback audio
const unmuteMarker = "                const frameA = document.getElementById('channel-frame-a');";
const unmuteAudioHook = `                const fallbackAudio = document.getElementById('mcr-fallback-audio');
                if (fallbackAudio) {
                    fallbackAudio.muted = false;
                    if (isStandbyFallbackActive) fallbackAudio.play().catch(() => {});
                }
                const frameA = document.getElementById('channel-frame-a');`;

if (!content.includes('fallbackAudio.muted = false')) {
    content = content.replace(unmuteMarker, unmuteAudioHook);
}

// In muteSubframe, add muting of fallback audio
const muteMarker = "                const frameA = document.getElementById('channel-frame-a');";
const muteAudioHook = `                const fallbackAudio = document.getElementById('mcr-fallback-audio');
                if (fallbackAudio) {
                    fallbackAudio.muted = true;
                }
                const frameA = document.getElementById('channel-frame-a');`;

if (!content.includes('fallbackAudio.muted = true')) {
    // Replace the second occurrence (which is inside muteSubframe)
    const idxFirst = content.indexOf(unmuteMarker);
    const idxSecond = content.indexOf(unmuteMarker, idxFirst + unmuteMarker.length);
    if (idxSecond !== -1) {
        content = content.slice(0, idxSecond) + muteAudioHook + content.slice(idxSecond + unmuteMarker.length);
    }
}

// In switchChannel, dismiss standby fallback on forced scheduled block switch
const switchOld = "            if (currentUrl === newChannel && !force) return;";
const switchNew = `            if (currentUrl === newChannel && !force) return;
            if (isStandbyFallbackActive && force) {
                deactivateStandbyFallback();
            }`;
if (!content.includes('if (isStandbyFallbackActive && force)')) {
    content = content.replace(switchOld, switchNew);
}

fs.writeFileSync(masterPath, content, 'utf8');
console.log('Successfully patched master-live.html');
