import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('master-live: DOM structure has emergency audio and standby slate', () => {
    const html = fs.readFileSync(path.join(rootDir, 'master-live.html'), 'utf8');

    // 1. Audio fallback element
    assert.ok(html.includes('id="mcr-fallback-audio"'), 'Must contain audio#mcr-fallback-audio');
    assert.ok(html.includes('src="https://stream.zeno.fm/gn3uhltrrytuv"'), 'Must stream continuous Christian Culture backup audio');

    // 2. Standby slate overlay
    assert.ok(html.includes('id="mcr-standby-slate"'), 'Must contain div#mcr-standby-slate');
    assert.ok(html.includes('mcr-standby-glass-card'), 'Must contain mcr-standby-glass-card styling');
    assert.ok(html.includes('mcr-standby-equalizer'), 'Must contain audio equalizer animation');
    assert.ok(html.includes('CHWILOWA PRZERWA TECHNICZNA'), 'Must have user-facing friendly message');

    // 3. Watchdog & event logging
    assert.ok(html.includes('cc_mcr_error_log'), 'Must persist errors with timestamp to localStorage');
    assert.ok(html.includes('handleYtPlayerError'), 'Must define YouTube player error watchdog');
    assert.ok(html.includes('activateStandbyFallback'), 'Must define activateStandbyFallback');
    assert.ok(html.includes('deactivateStandbyFallback'), 'Must define deactivateStandbyFallback');

    // 4. Suppress child click overlay
    assert.ok(html.includes('#startOverlay, .start-overlay'), 'Must suppress startOverlay from child frames');
});

test('master-live: watchdog logic flow (first error retries, repeated error activates fallback)', () => {
    // Mock minimal browser environment
    const storage = {};
    const mockLocalStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); }
    };

    let audioPlayed = false;
    let audioPaused = false;
    let slateShown = false;

    const mockSlate = {
        classList: {
            add: (cls) => { if (cls === 'show') slateShown = true; },
            remove: (cls) => { if (cls === 'show') slateShown = false; },
            contains: (cls) => (cls === 'show' ? slateShown : false)
        },
        setAttribute: () => {}
    };

    const mockAudio = {
        currentTime: 0,
        muted: false,
        play: () => { audioPlayed = true; audioPaused = false; return Promise.resolve(); },
        pause: () => { audioPaused = true; audioPlayed = false; }
    };

    let activeFrameSrc = '';
    const mockFrame = {
        set src(v) { activeFrameSrc = v; },
        get src() { return activeFrameSrc; }
    };

    // Simulate watchdog logic as implemented in master-live.html
    let ytErrorCount = 0;
    let ytLastErrorTime = 0;
    let ytRetryTimer = null;
    let isStandbyFallbackActive = false;
    let currentUrl = 'spiewajmy-panu-live.html';

    function logMcrEvent(eventDescription, details = {}) {
        const now = new Date();
        const entry = {
            iso: now.toISOString(),
            localTime: now.toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }),
            event: eventDescription,
            details: details
        };
        let logs = JSON.parse(mockLocalStorage.getItem('cc_mcr_error_log') || '[]');
        logs.push(entry);
        mockLocalStorage.setItem('cc_mcr_error_log', JSON.stringify(logs));
    }

    function reloadActiveSubchannel() {
        mockFrame.src = currentUrl + '?autoplay=1&t=' + Date.now();
        logMcrEvent('Wymuszone przeładowanie aktywnego kanału', { channel: currentUrl });
    }

    function activateStandbyFallback() {
        if (isStandbyFallbackActive) return;
        isStandbyFallbackActive = true;
        logMcrEvent('Uruchomienie planszy awaryjnej oraz zapasowego strumienia audio', { channel: currentUrl });
        mockSlate.classList.add('show');
        mockAudio.play();
    }

    function deactivateStandbyFallback() {
        if (!isStandbyFallbackActive) return;
        isStandbyFallbackActive = false;
        ytErrorCount = 0;
        if (ytRetryTimer) { clearTimeout(ytRetryTimer); ytRetryTimer = null; }
        mockSlate.classList.remove('show');
        mockAudio.pause();
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
            ytRetryTimer = setTimeout(() => {
                reloadActiveSubchannel();
            }, 3000);
        } else {
            logMcrEvent('Powtórzony błąd odtwarzacza YouTube — włączenie planszy awaryjnej z muzyką', { errorCount: ytErrorCount, channel: currentUrl });
            activateStandbyFallback();
        }
    }

    // Step 1: Initial state
    assert.equal(ytErrorCount, 0);
    assert.equal(isStandbyFallbackActive, false);
    assert.equal(slateShown, false);
    assert.equal(audioPlayed, false);

    // Step 2: First error (e.g. error 150) -> Retries after 3s, slate is NOT shown
    handleYtPlayerError(150);
    assert.equal(ytErrorCount, 1);
    assert.equal(isStandbyFallbackActive, false, 'First error should not trigger standby fallback immediately');
    assert.equal(slateShown, false);
    assert.equal(audioPlayed, false);
    assert.ok(ytRetryTimer !== null, 'Retry timer must be set');

    const logsAfterFirst = JSON.parse(mockLocalStorage.getItem('cc_mcr_error_log'));
    assert.ok(logsAfterFirst.length >= 2, 'Must log error and retry scheduling');
    assert.equal(logsAfterFirst[0].details.code, 150);
    assert.ok(logsAfterFirst[0].iso.includes('T'), 'Must include ISO timestamp');
    assert.ok(logsAfterFirst[0].localTime.length > 5, 'Must include Warsaw local time');

    // Step 3: Second error within 60s -> Activates standby slate and audio backup
    handleYtPlayerError(150);
    assert.equal(ytErrorCount, 2);
    assert.equal(isStandbyFallbackActive, true, 'Second error MUST activate standby fallback');
    assert.equal(slateShown, true, 'Standby slate must be visible');
    assert.equal(audioPlayed, true, 'Fallback audio stream must play');

    const logsAfterSecond = JSON.parse(mockLocalStorage.getItem('cc_mcr_error_log'));
    assert.ok(logsAfterSecond.some(l => l.event.includes('Powtórzony błąd')), 'Log must contain repeated error alert');

    // Step 4: Recovery on player resume
    deactivateStandbyFallback();
    assert.equal(isStandbyFallbackActive, false);
    assert.equal(ytErrorCount, 0);
    assert.equal(slateShown, false, 'Standby slate must be hidden on recovery');
    assert.equal(audioPaused, true, 'Fallback audio stream must pause on recovery');

    if (ytRetryTimer) clearTimeout(ytRetryTimer);
});

test('spiewajmy-panu-live: bubbles YouTube player events and suppresses startOverlay in OBS', () => {
    const html = fs.readFileSync(path.join(rootDir, 'spiewajmy-panu-live.html'), 'utf8');

    assert.ok(html.includes("type: 'YT_PLAYER_ERROR'"), 'spiewajmy-panu must postMessage YT_PLAYER_ERROR on error');
    assert.ok(html.includes("type: 'YT_PLAYER_PLAYING'"), 'spiewajmy-panu must postMessage YT_PLAYER_PLAYING on play');
    assert.ok(html.includes("type: 'YT_PLAYER_READY'"), 'spiewajmy-panu must postMessage YT_PLAYER_READY on ready');
    assert.ok(html.includes('isObsOrMcr'), 'spiewajmy-panu must detect OBS/MCR');
    assert.ok(html.includes('body.inside-iframe #startOverlay'), 'spiewajmy-panu must suppress startOverlay via CSS');
});

test('codzienne-uwielbienie-live: bubbles YouTube player events and suppresses startOverlay in OBS', () => {
    const html = fs.readFileSync(path.join(rootDir, 'codzienne-uwielbienie-live.html'), 'utf8');

    assert.ok(html.includes("type: 'YT_PLAYER_ERROR'"), 'codzienne-uwielbienie must postMessage YT_PLAYER_ERROR on error');
    assert.ok(html.includes("type: 'YT_PLAYER_PLAYING'"), 'codzienne-uwielbienie must postMessage YT_PLAYER_PLAYING on play');
    assert.ok(html.includes("type: 'YT_PLAYER_READY'"), 'codzienne-uwielbienie must postMessage YT_PLAYER_READY on ready');
    assert.ok(html.includes('isObsOrMcr'), 'codzienne-uwielbienie must detect OBS/MCR');
    assert.ok(html.includes('TIMEOUT_8S'), 'codzienne-uwielbienie must have 8s timeout watchdog');
    assert.ok(html.includes('body.inside-iframe #startOverlay'), 'codzienne-uwielbienie must suppress startOverlay via CSS');
});

test('studium-live: bubbles YouTube player events and suppresses startOverlay in OBS', () => {
    const html = fs.readFileSync(path.join(rootDir, 'studium-live.html'), 'utf8');

    assert.ok(html.includes("type: 'YT_PLAYER_ERROR'"), 'studium-live must postMessage YT_PLAYER_ERROR on error');
    assert.ok(html.includes("type: 'YT_PLAYER_PLAYING'"), 'studium-live must postMessage YT_PLAYER_PLAYING on play');
    assert.ok(html.includes("type: 'YT_PLAYER_READY'"), 'studium-live must postMessage YT_PLAYER_READY on ready');
    assert.ok(html.includes('isObsOrMcr'), 'studium-live must detect OBS/MCR');
    assert.ok(html.includes('TIMEOUT_8S'), 'studium-live must have 8s timeout watchdog');
    assert.ok(html.includes('body.inside-iframe #startOverlay'), 'studium-live must suppress startOverlay via CSS');
});
