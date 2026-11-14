import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
        /function unmuteSubframe\(\)[\s\S]{0,600}unmuteFrame\(getActiveFrame\(\)\)/.test(html),
        'unmuteSubframe must unmute only getActiveFrame()'
    );
    assert.ok(
        html.includes("if (m.id === 'ccWorshipFallbackAudio' && m.paused) return;"),
        'unmuteFrame must never force-start paused ccWorshipFallbackAudio alongside YouTube'
    );
});

test('subchannels: ccWorshipFallbackAudio stays muted & unloaded when YouTube plays or frame is preloaded muted', () => {
    for (const file of ['spiewajmy-panu-live.html', 'codzienne-uwielbienie-live.html', 'studium-live.html']) {
        const html = fs.readFileSync(path.join(rootDir, file), 'utf8');
        assert.ok(html.includes("id=\"ccWorshipFallbackAudio\""), `${file}: keeps fallback audio tag`);
        assert.ok(html.includes("isFrameMuted"), `${file}: tracks frame mute state to prevent background preload overlap`);
        assert.ok(html.includes("audio.removeAttribute('src')"), `${file}: unloads fallback audio src on stopFallback so nothing can resume it alongside YouTube`);
        assert.ok(html.includes("type: 'YT_PLAYER_PLAYING'"), `${file}: preserves YT_PLAYER_PLAYING notification`);
        assert.ok(html.includes("type: 'YT_PLAYER_READY'"), `${file}: preserves YT_PLAYER_READY notification`);
        assert.ok(html.includes('body.inside-iframe #startOverlay'), `${file}: suppresses startOverlay in iframe`);
    }
});
