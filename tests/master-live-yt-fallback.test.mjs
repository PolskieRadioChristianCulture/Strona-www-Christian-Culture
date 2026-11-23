import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('master-live: no technical-break standby slate, Zeno overlap stream, or 8s reload loop', () => {
    const html = fs.readFileSync(path.join(rootDir, 'master-live.html'), 'utf8');

    assert.equal(html.includes('CHWILOWA PRZERWA TECHNICZNA'), false, 'Standby slate must not appear on live broadcast');
    assert.equal(html.includes('id="mcr-standby-slate"'), false, 'Standby slate DOM element must be removed');
    assert.equal(html.includes('id="mcr-fallback-audio"'), false, 'Separate Zeno fallback audio element must be removed so two audio sources never overlap');
    assert.equal(html.includes('SUBFRAME_INIT_TIMEOUT_8S'), false, 'Broken 8s subframe watchdog reloading active channels must be removed');
    assert.equal(html.includes('activateStandbyFallback'), false, 'Standby fallback activation must be removed');
});

test('master-live: isolates active and inactive iframes during unmute and bumper transitions', () => {
    const html = fs.readFileSync(path.join(rootDir, 'master-live.html'), 'utf8');

    assert.ok(html.includes('function silenceFrame('), 'Must define single-frame silencer helper');
    assert.ok(html.includes('function unmuteFrame('), 'Must define single-frame unmute helper');
    assert.ok(html.includes('function clearSwitchTimers()'), 'Must clear prior transition timers on channel switch');

    // Regression: unmuteSubframe previously iterated [frameA, frameB].forEach and called play() on both frames + fallback audio
    assert.equal(
        /function unmuteSubframe\(\)[\s\S]{0,900}\[frameA,\s*frameB\]\.forEach/.test(html),
        false,
        'unmuteSubframe must never iterate and unmute both frames simultaneously'
    );
    assert.ok(
        /function unmuteSubframe\(\)[\s\S]{0,900}unmuteFrame\(getActiveFrame\(\)\)/.test(html),
        'unmuteSubframe must unmute only getActiveFrame()'
    );
    assert.ok(
        html.includes("if (m.id === 'ccWorshipFallbackAudio') return;"),
        'unmuteFrame must never directly unmute ccWorshipFallbackAudio independently of the subframe mutual-exclusion guard'
    );
});

test('subchannels: mutual-exclusion audio guard & YouTube postMessage liveness tracking', () => {
    for (const file of ['spiewajmy-panu-live.html', 'codzienne-uwielbienie-live.html', 'studium-live.html']) {
        const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
        assert.ok(html.includes('id="ccWorshipFallbackAudio"'), `${file}: keeps fallback audio tag`);
        assert.ok(html.includes('isFrameMuted'), `${file}: tracks frame mute state to prevent background preload overlap`);
        assert.ok(html.includes("audio.removeAttribute('src')"), `${file}: unloads fallback audio src on stopFallback so nothing can resume it alongside YouTube`);
        assert.ok(html.includes("type: 'YT_PLAYER_PLAYING'"), `${file}: preserves YT_PLAYER_PLAYING notification`);
        assert.ok(html.includes("type: 'YT_PLAYER_READY'"), `${file}: preserves YT_PLAYER_READY notification`);
        assert.ok(html.includes('body.inside-iframe #startOverlay'), `${file}: suppresses startOverlay in iframe`);

        assert.ok(html.includes('window.__ccAudioGuard'), `${file}: defines __ccAudioGuard mutual-exclusion controller`);
        for (const fn of ['muteYouTubeOnly', 'isFallbackActive', 'isYtConfirmedAlive', 'stopFallback']) {
            assert.ok(html.includes(`${fn}:`), `${file}: __ccAudioGuard exposes ${fn}`);
        }
        assert.match(
            html,
            /function startFallback\(reason\)\s*\{[\s\S]{0,220}muteYouTubeOnly\(\);[\s\S]{0,120}fallbackOn = true;/,
            `${file}: startFallback must mute YouTube BEFORE activating fallback audio`
        );
        assert.match(
            html,
            /function enableAudio\(\)\s*\{[\s\S]{0,400}isFallbackActive\(\)/,
            `${file}: enableAudio must check isFallbackActive() before unmuting YouTube`
        );
        assert.ok(html.includes('infoDelivery'), `${file}: tracks YouTube infoDelivery liveness`);
        assert.ok(html.includes('currentTime'), `${file}: tracks YouTube currentTime progression`);
        assert.match(
            html,
            /if \(window\.YT && window\.YT\.Player && !ytPlayerInitStarted\)/,
            `${file}: handles cached/early YT.Player load before onYouTubeIframeAPIReady definition`
        );
    }
});

function createSubchannelHarness(file, searchQuery) {
    const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
    const scriptMatches = [...html.matchAll(/<script(?:\s+[^>]*)?>([\s\S]*?)<\/script>/gi)]
        .map((m) => m[1])
        .filter((s) => s.trim().length > 0);
    // Evaluate head isObsOrMcr script + main player script + fallback guard script
    const headScript = scriptMatches.find((s) => s.includes('isObsOrMcr'));
    const playerScript = scriptMatches.find((s) => s.includes('function onYouTubeIframeAPIReady'));
    const fallbackScript = scriptMatches.find((s) => s.includes('ccWorshipFallbackAudio'));
    assert.ok(headScript && playerScript && fallbackScript, `${file}: expected inline scripts present`);

    let fakeNow = 1_700_000_000_000;
    const ops = [];
    const intervals = [];
    const timeouts = [];
    const windowListeners = {};

    function makeMockElement(id) {
        const attrs = {};
        const listeners = {};
        const el = {
            id,
            style: {},
            textContent: '',
            innerHTML: '',
            className: '',
            _src: '',
            muted: true,
            paused: true,
            volume: 1,
            classList: { add() {}, remove() {}, toggle() {} },
            addEventListener(ev, fn) { (listeners[ev] ||= []).push(fn); },
            dispatchEvent(ev, data) { (listeners[ev] || []).forEach((fn) => fn(data)); },
            setAttribute(k, v) { attrs[k] = String(v); if (k === 'src') this._src = String(v); },
            getAttribute(k) { return k === 'src' ? (attrs.src ?? (this._src || null)) : (attrs[k] ?? null); },
            removeAttribute(k) {
                delete attrs[k];
                if (k === 'src') {
                    this._src = '';
                    ops.push(`${id}:removeSrc`);
                }
            },
            pause() {
                this.paused = true;
                ops.push(`${id}:pause`);
            },
            load() {
                ops.push(`${id}:load`);
            },
            play() {
                this.paused = false;
                ops.push(`${id}:play`);
                return Promise.resolve();
            },
        };
        Object.defineProperty(el, 'src', {
            get() { return this._src; },
            set(v) {
                this._src = String(v || '');
                attrs.src = this._src;
                ops.push(`${id}:src:${this._src}`);
            },
        });
        if (id === 'yt-player') {
            el.contentWindow = {
                postMessage(msg, target) {
                    ops.push(`yt:postMessage:${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
                },
            };
        }
        return el;
    }

    const elements = new Map();
    const getEl = (id) => {
        if (!elements.has(id)) elements.set(id, makeMockElement(id));
        return elements.get(id);
    };
    // Pre-create key elements
    getEl('yt-player');
    getEl('ccWorshipFallbackAudio');
    getEl('startOverlay');

    class FakeDate extends Date {
        constructor(...args) {
            super(...(args.length ? args : [fakeNow]));
        }
        static now() { return fakeNow; }
    }

    const documentObj = {
        readyState: 'complete',
        documentElement: { classList: { add() {}, remove() {}, toggle() {} } },
        body: { classList: { add() {}, remove() {}, toggle() {} } },
        getElementById: (id) => getEl(id),
        querySelector: (sel) => {
            if (sel && sel.includes('yt-player')) return getEl('yt-player');
            return makeMockElement(sel || 'qs');
        },
        addEventListener() {},
    };

    const windowObj = {
        location: {
            search: searchQuery,
            origin: 'https://polskieradio.cc',
            href: `https://polskieradio.cc/${file}${searchQuery}`,
        },
        obsstudio: { pluginVersion: '33.0.3' },
        self: null,
        top: { name: 'top' },
        parent: { postMessage() {} },
        document: documentObj,
        navigator: {},
        addEventListener(ev, fn) { (windowListeners[ev] ||= []).push(fn); },
        YT: {
            PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
            Player: function MockBrokenYtPlayer() {
                this.getPlayerState = () => { throw new TypeError('this.api.isExternalMethodAvailable is not a function'); };
                this.mute = () => { ops.push('yt:apiMute'); };
                this.unMute = () => { ops.push('yt:apiUnMute'); };
                this.setVolume = (v) => { ops.push(`yt:apiVol:${v}`); };
                this.playVideo = () => { ops.push('yt:apiPlay'); };
                this.setLoop = () => {};
                this.loadPlaylist = () => {};
                this.setShuffle = () => {};
            },
        },
    };
    windowObj.self = windowObj;
    windowObj.window = windowObj;

    const context = {
        window: windowObj,
        document: documentObj,
        location: windowObj.location,
        YT: windowObj.YT,
        URL,
        URLSearchParams,
        Date: FakeDate,
        Math,
        JSON,
        Promise,
        RegExp,
        Array,
        Object,
        Number,
        String,
        Boolean,
        Error,
        TypeError,
        console: { log() {}, warn() {}, info() {}, error() {} },
        fetch: () => Promise.resolve({
            json: () => Promise.resolve([{ url: './audio/worship/CCM%20(1).mp3' }, { url: './audio/worship/CCM%20(2).mp3' }]),
        }),
        setInterval: (fn, ms) => { intervals.push({ fn, ms }); return intervals.length; },
        clearInterval() {},
        setTimeout: (fn, ms) => { timeouts.push({ fn, ms }); return timeouts.length; },
        clearTimeout() {},
        addEventListener: windowObj.addEventListener,
    };

    vm.createContext(context);
    vm.runInContext(headScript, context);
    vm.runInContext(playerScript, context);
    vm.runInContext(fallbackScript, context);

    return {
        window: windowObj,
        ops,
        fallbackAudio: getEl('ccWorshipFallbackAudio'),
        advanceMs(ms) {
            fakeNow += ms;
            intervals.forEach((it) => it.fn());
        },
        emitMessage(eventObj) {
            (windowListeners.message || []).forEach((fn) => fn(eventObj));
        },
        flushPromises: () => new Promise((resolve) => setTimeout(resolve, 15)),
    };
}

test('VM simulation: broken getPlayerState + live YouTube infoDelivery/currentTime never activates fallback (single audio source)', async () => {
    for (const file of ['spiewajmy-panu-live.html', 'codzienne-uwielbienie-live.html', 'studium-live.html']) {
        const h = createSubchannelHarness(file, '?autoplay=1&in_mcr=1&noticker=1');
        // Parent unmute arrives before YT confirms playback -> must ping YT, NOT blindly send unMute
        h.emitMessage({ origin: 'https://polskieradio.cc', data: { type: 'UNMUTE_AUDIO' } });
        assert.equal(
            h.ops.some((o) => o.includes('"func":"unMute"')),
            false,
            `${file}: must not send raw unMute while YT API has not confirmed liveness`
        );

        // YouTube iframe responds with infoDelivery while player.getPlayerState() is throwing
        h.emitMessage({
            origin: 'https://www.youtube.com',
            data: JSON.stringify({ event: 'infoDelivery', info: { playerState: 1, currentTime: 1.0, muted: true } }),
        });
        assert.equal(
            h.ops.some((o) => o.includes('"func":"unMute"')),
            true,
            `${file}: unmutes YouTube once infoDelivery confirms playerState=1`
        );

        // Advance well past watchdog threshold while currentTime advances periodically
        for (let i = 1; i <= 8; i++) {
            h.emitMessage({
                origin: 'https://www.youtube.com',
                data: JSON.stringify({ event: 'infoDelivery', info: { currentTime: 1.0 + i * 2 } }),
            });
            h.advanceMs(3000);
        }
        await h.flushPromises();

        const st = h.window.ccWorshipFallbackState();
        assert.equal(st.ytPlaying, true, `${file}: ytIsPlaying remains true via infoDelivery/currentTime`);
        assert.equal(st.fallbackOn, false, `${file}: fallback never activates while YouTube is alive`);
        assert.equal(h.fallbackAudio.paused, true, `${file}: fallback audio remains paused`);
        assert.equal(h.fallbackAudio.muted, true, `${file}: fallback audio remains muted`);
    }
});

test('VM simulation: dead YouTube activates fallback ONLY after muting YouTube, and YouTube recovery stops fallback BEFORE unmuting YouTube', async () => {
    for (const file of ['spiewajmy-panu-live.html', 'codzienne-uwielbienie-live.html', 'studium-live.html']) {
        const h = createSubchannelHarness(file, '?autoplay=1&in_mcr=1&noticker=1');
        h.emitMessage({ origin: 'https://polskieradio.cc', data: { type: 'UNMUTE_AUDIO' } });

        // Advance past worst-case threshold (12s) with zero YouTube response
        h.advanceMs(13000);
        await h.flushPromises();

        let st = h.window.ccWorshipFallbackState();
        assert.equal(st.fallbackOn, true, `${file}: fallback turns ON when YouTube is dead`);
        assert.equal(h.fallbackAudio.paused, false, `${file}: fallback audio plays`);
        assert.equal(h.fallbackAudio.muted, false, `${file}: fallback audio unmuted`);

        // Prove YouTube was muted BEFORE fallback started playing
        const ytMuteIdx = h.ops.findIndex((o) => o.includes('"func":"mute"'));
        const fbPlayIdx = h.ops.findIndex((o) => o === 'ccWorshipFallbackAudio:play');
        assert.ok(ytMuteIdx !== -1 && fbPlayIdx !== -1 && ytMuteIdx < fbPlayIdx, `${file}: YouTube muted before fallback play`);

        // Subsequent UNMUTE_AUDIO retry from parent must NOT unmute YouTube while fallback is active
        const opsBeforeRetry = h.ops.length;
        h.emitMessage({ origin: 'https://polskieradio.cc', data: { type: 'UNMUTE_AUDIO' } });
        const retryOps = h.ops.slice(opsBeforeRetry);
        assert.equal(
            retryOps.some((o) => o.includes('"func":"unMute"')),
            false,
            `${file}: must never unmute YouTube while fallback audio is active`
        );

        // Now YouTube recovers via infoDelivery -> fallback MUST pause & removeSrc BEFORE YouTube unMute
        const recoveryStart = h.ops.length;
        h.emitMessage({
            origin: 'https://www.youtube.com',
            data: JSON.stringify({ event: 'infoDelivery', info: { playerState: 1, muted: true } }),
        });
        const recoveryOps = h.ops.slice(recoveryStart);
        const pauseIdx = recoveryOps.indexOf('ccWorshipFallbackAudio:pause');
        const removeIdx = recoveryOps.indexOf('ccWorshipFallbackAudio:removeSrc');
        const unmuteIdx = recoveryOps.findIndex((o) => o.includes('"func":"unMute"'));
        assert.ok(pauseIdx !== -1 && removeIdx !== -1 && unmuteIdx !== -1, `${file}: recovery executes pause, removeSrc, and unMute`);
        assert.ok(pauseIdx < unmuteIdx && removeIdx < unmuteIdx, `${file}: fallback fully stops & unloads BEFORE YouTube unMute`);

        st = h.window.ccWorshipFallbackState();
        assert.equal(st.fallbackOn, false, `${file}: fallback OFF after YouTube recovery`);
        assert.equal(h.fallbackAudio.paused, true, `${file}: fallback audio paused after recovery`);
        assert.equal(h.fallbackAudio.muted, true, `${file}: fallback audio muted after recovery`);
    }
});

test('VM simulation: preloaded muted background iframe never starts fallback audio', async () => {
    for (const file of ['spiewajmy-panu-live.html', 'codzienne-uwielbienie-live.html', 'studium-live.html']) {
        const h = createSubchannelHarness(file, '?autoplay=1&in_mcr=1&muted=1');
        h.advanceMs(30000);
        await h.flushPromises();

        const st = h.window.ccWorshipFallbackState();
        assert.equal(st.fallbackOn, false, `${file}: preloaded muted frame never starts fallback`);
        assert.equal(h.fallbackAudio.paused, true, `${file}: preloaded muted fallback stays paused`);
        assert.equal(h.ops.some((o) => o.includes('"func":"unMute"')), false, `${file}: preloaded muted frame never unmutes YouTube`);
    }
});
