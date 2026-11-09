import fs from 'node:fs';

const baseDir = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

// ── 1. MASTER-LIVE.HTML ──
const masterPath = `${baseDir}/master-live.html`;
let master = fs.readFileSync(masterPath, 'utf8');

// Add startOverlay to ccn-master-ticker-suppressor
if (!master.includes('#startOverlay, .start-overlay')) {
    master = master.replace(
        '.episode-badge-box, #episode-badge-box {',
        '.episode-badge-box, #episode-badge-box,\r\n                            #startOverlay, .start-overlay, #masterUnmuteBanner {'
    );
}

// In suppressSubframeTicker, actively hide overlay
if (!master.includes('doc.getElementById("startOverlay")')) {
    master = master.replace(
        'if (!doc.getElementById(\'ccn-master-ticker-suppressor\')) {',
        `try {
                        const so = doc.getElementById("startOverlay") || doc.querySelector(".start-overlay");
                        if (so) so.style.display = "none";
                    } catch(e) {}
                    if (!doc.getElementById('ccn-master-ticker-suppressor')) {`
    );
}

// Add MCR 8s subframe readiness watchdog when switching channels
const mcrWatchdogHook = `            // 8-second subframe watchdog in MCR: if child fails to report ready or play, handle error
            let subframeReadyReported = false;
            const subframeWatchdogTimer = setTimeout(() => {
                if (!subframeReadyReported && !isStandbyFallbackActive) {
                    logMcrEvent('Subkanał nie zgłosił gotowości w 8s — uruchomienie procedury naprawczej', { channel: newChannel });
                    handleYtPlayerError('SUBFRAME_INIT_TIMEOUT_8S');
                }
            }, 8000);
            window.__activeSubframeWatchdog = subframeWatchdogTimer;`;

if (!master.includes('SUBFRAME_INIT_TIMEOUT_8S')) {
    master = master.replace(
        '            if (isFirstLoad) {',
        mcrWatchdogHook + '\r\n            if (isFirstLoad) {'
    );
    // In message listener when YT_PLAYER_PLAYING or READY arrives, clear the watchdog
    master = master.replace(
        "if (type === 'YT_PLAYER_PLAYING' || type === 'YT_PLAYER_READY') {",
        `if (type === 'YT_PLAYER_PLAYING' || type === 'YT_PLAYER_READY') {
                if (window.__activeSubframeWatchdog) {
                    clearTimeout(window.__activeSubframeWatchdog);
                    window.__activeSubframeWatchdog = null;
                }`
    );
}

fs.writeFileSync(masterPath, master, 'utf8');
console.log('master-live.html updated');

// ── 2. CODZIENNE-UWIELBIENIE-LIVE.HTML ──
const codziennePath = `${baseDir}/codzienne-uwielbienie-live.html`;
let codzienne = fs.readFileSync(codziennePath, 'utf8');

// Hide overlay in OBS or iframe immediately
const obsOverlaySuppress = `
        /* In OBS Studio or when embedded in Master Live, hide startOverlay immediately */
        body.inside-iframe #startOverlay,
        html.no-ticker #startOverlay,
        html.embedded-mode #startOverlay {
            display: none !important;
        }
`;
if (!codzienne.includes('body.inside-iframe #startOverlay')) {
    codzienne = codzienne.replace('    </style>', obsOverlaySuppress + '    </style>');
}

// Hide overlay in JS for OBS / MCR
if (!codzienne.includes('isObsOrMcr')) {
    codzienne = codzienne.replace(
        '    <script>',
        `    <script>
        const isObsOrMcr = Boolean(window.obsstudio || window.self !== window.top || window.location.search.includes('in_mcr=1') || window.location.search.includes('noticker'));
        if (isObsOrMcr) {
            window.addEventListener('DOMContentLoaded', () => {
                const so = document.getElementById("startOverlay");
                if (so) so.style.display = "none";
            });
        }`
    );
}

// 8s watchdog in codzienne-uwielbienie-live
if (!codzienne.includes('ytReadyFired')) {
    codzienne = codzienne.replace(
        '        function onPlayerReady(event) {',
        `        let ytReadyFired = false;
        setTimeout(() => {
            if (!ytReadyFired) {
                console.warn("YouTube Player failed to become ready within 8s. Notifying parent...");
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_ERROR', code: 'TIMEOUT_8S', time: Date.now() }, '*');
                    }
                } catch(e) {}
            }
        }, 8000);

        function onPlayerReady(event) {
            ytReadyFired = true;
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'YT_PLAYER_READY' }, '*');
                }
            } catch(e) {}`
    );
}

// PostMessage on error in codzienne
if (!codzienne.includes("type: 'YT_PLAYER_ERROR'") || !codzienne.includes("window.parent.postMessage({ type: 'YT_PLAYER_ERROR'")) {
    codzienne = codzienne.replace(
        '        function onPlayerError(event) {',
        `        function onPlayerError(event) {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'YT_PLAYER_ERROR', code: (event && event.data !== undefined) ? event.data : -1, time: Date.now() }, '*');
                }
            } catch(e) {}`
    );
}

// PostMessage on PLAYING in codzienne
if (!codzienne.includes("postMessage({ type: 'YT_PLAYER_PLAYING' }")) {
    codzienne = codzienne.replace(
        '            if (event.data === YT.PlayerState.PLAYING) {',
        `            if (event.data === YT.PlayerState.PLAYING) {
                ytReadyFired = true;
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_PLAYING' }, '*');
                    }
                } catch(e) {}`
    );
}

fs.writeFileSync(codziennePath, codzienne, 'utf8');
console.log('codzienne-uwielbienie-live.html updated');

// ── 3. SPIEWAJMY-PANU-LIVE.HTML ──
const spiewajmyPath = `${baseDir}/spiewajmy-panu-live.html`;
let spiewajmy = fs.readFileSync(spiewajmyPath, 'utf8');

if (!spiewajmy.includes('body.inside-iframe #startOverlay')) {
    spiewajmy = spiewajmy.replace('    </style>', obsOverlaySuppress + '    </style>');
}

if (!spiewajmy.includes('isObsOrMcr')) {
    spiewajmy = spiewajmy.replace(
        '    <script>',
        `    <script>
        const isObsOrMcr = Boolean(window.obsstudio || window.self !== window.top || window.location.search.includes('in_mcr=1') || window.location.search.includes('noticker'));
        if (isObsOrMcr) {
            window.addEventListener('DOMContentLoaded', () => {
                const so = document.getElementById("startOverlay");
                if (so) so.style.display = "none";
            });
        }`
    );
}

if (!spiewajmy.includes('ytReadyFired')) {
    spiewajmy = spiewajmy.replace(
        '        function onPlayerReady(event) {',
        `        let ytReadyFired = false;
        setTimeout(() => {
            if (!ytReadyFired) {
                console.warn("YouTube Player failed to become ready within 8s. Notifying parent...");
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_ERROR', code: 'TIMEOUT_8S', time: Date.now() }, '*');
                    }
                } catch(e) {}
            }
        }, 8000);

        function onPlayerReady(event) {
            ytReadyFired = true;`
    );
}

fs.writeFileSync(spiewajmyPath, spiewajmy, 'utf8');
console.log('spiewajmy-panu-live.html updated');

// ── 4. STUDIUM-LIVE.HTML ──
const studiumPath = `${baseDir}/studium-live.html`;
let studium = fs.readFileSync(studiumPath, 'utf8');

if (!studium.includes('body.inside-iframe #startOverlay')) {
    studium = studium.replace('    </style>', obsOverlaySuppress + '    </style>');
}

if (!studium.includes('isObsOrMcr')) {
    studium = studium.replace(
        '    <script>',
        `    <script>
        const isObsOrMcr = Boolean(window.obsstudio || window.self !== window.top || window.location.search.includes('in_mcr=1') || window.location.search.includes('noticker'));
        if (isObsOrMcr) {
            window.addEventListener('DOMContentLoaded', () => {
                const so = document.getElementById("startOverlay");
                if (so) so.style.display = "none";
            });
        }`
    );
}

// Add onError in YT.Player events if missing
if (!studium.includes("'onError': onPlayerError")) {
    studium = studium.replace(
        "'onStateChange': onPlayerStateChange",
        "'onStateChange': onPlayerStateChange,\r\n                    'onError': onPlayerError"
    );
}

// Define onPlayerError & 8s watchdog in studium-live.html
if (!studium.includes('function onPlayerError')) {
    studium = studium.replace(
        '        function onPlayerReady(event) {',
        `        let ytReadyFired = false;
        setTimeout(() => {
            if (!ytReadyFired) {
                console.warn("YouTube Player failed to become ready within 8s. Notifying parent...");
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_ERROR', code: 'TIMEOUT_8S', time: Date.now() }, '*');
                    }
                } catch(e) {}
            }
        }, 8000);

        function onPlayerError(event) {
            console.warn("Studium YouTube encountered error (" + (event ? event.data : 'unknown') + "). Notifying parent...");
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'YT_PLAYER_ERROR', code: (event && event.data !== undefined) ? event.data : -1, time: Date.now() }, '*');
                }
            } catch(e) {}
        }

        function onPlayerReady(event) {
            ytReadyFired = true;
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'YT_PLAYER_READY' }, '*');
                }
            } catch(e) {}`
    );
}

// In studium onPlayerStateChange when PLAYING
if (!studium.includes("type: 'YT_PLAYER_PLAYING'")) {
    studium = studium.replace(
        '            if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {',
        `            if (event.data === YT.PlayerState.PLAYING) {
                ytReadyFired = true;
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_PLAYING' }, '*');
                    }
                } catch(e) {}
            }
            if (event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.BUFFERING) {`
    );
}

fs.writeFileSync(studiumPath, studium, 'utf8');
console.log('studium-live.html updated');
