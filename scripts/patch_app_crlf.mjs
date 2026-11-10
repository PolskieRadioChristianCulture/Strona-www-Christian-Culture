import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const isCrlf = content.includes('\r\n');
const eol = isCrlf ? '\r\n' : '\n';

// 1. Dodaj youtubePlaylistId do radio_cc_women
content = content.replace(
    `streamUrl: "",`,
    `streamUrl: "",${eol}        youtubePlaylistId: "PLPkpY3wBciWM",`
);

// 2. W playRadio(): obsłuż youtubePlaylistId
const targetPlay = [
    '    if (!targetUrl) {',
    '        audio.pause();',
    '        audio.removeAttribute(\'src\');',
    '        currentAudioUrl = "";',
    '        playerTrackTitle.textContent = `${activeStation.name} — ${activeStation.tagline || \'Wkrótce emisja 24/7\'}`;',
    '        playerStatusText.textContent = "Oczekuje na emisję";',
    '        isPlaying = false;',
    '        updatePlayerUI(false);',
    '        return;',
    '    }'
].join(eol);

const replacementPlay = [
    '    if (activeStation && activeStation.youtubePlaylistId) {',
    '        audio.pause();',
    '        audio.removeAttribute(\'src\');',
    '        currentAudioUrl = "";',
    '        if (!ytBridgeReady || !ytPlayerBridge) {',
    '            ytPendingPlay = true;',
    '            playerStatusText.textContent = "Ładowanie YouTube…";',
    '            initYtBridge();',
    '            return;',
    '        }',
    '        playerStatusText.textContent = "Ładowanie playlisty…";',
    '        try {',
    '            ytPlayerBridge.loadPlaylist({',
    '                list: activeStation.youtubePlaylistId,',
    '                listType: \'playlist\',',
    '                index: 0,',
    '                startSeconds: 0',
    '            });',
    '        } catch(e) {',
    '            console.error("YT loadPlaylist error:", e);',
    '        }',
    '        isPlaying = true;',
    '        updatePlayerUI(true);',
    '        return;',
    '    }',
    '',
    '    if (!targetUrl) {',
    '        audio.pause();',
    '        audio.removeAttribute(\'src\');',
    '        currentAudioUrl = "";',
    '        playerTrackTitle.textContent = `${activeStation.name} — ${activeStation.tagline || \'Wkrótce emisja 24/7\'}`;',
    '        playerStatusText.textContent = "Oczekuje na emisję";',
    '        isPlaying = false;',
    '        updatePlayerUI(false);',
    '        return;',
    '    }'
].join(eol);

if (content.includes(targetPlay)) {
    content = content.replace(targetPlay, replacementPlay);
    console.log('✓ Replaced playRadio logic');
} else {
    console.error('✗ targetPlay not found');
}

// 3. W pauseRadio(): zatrzymaj ytPlayerBridge
const targetPause = [
    '    stopFade();',
    '    audio.pause();',
    '    audio.volume = previousVolume;'
].join(eol);

const replacementPause = [
    '    stopFade();',
    '    if (ytPlayerBridge && typeof ytPlayerBridge.pauseVideo === \'function\') {',
    '        try { ytPlayerBridge.pauseVideo(); } catch(e) {}',
    '    }',
    '    audio.pause();',
    '    audio.volume = previousVolume;'
].join(eol);

if (content.includes(targetPause)) {
    content = content.replace(targetPause, replacementPause);
    console.log('✓ Replaced pauseRadio logic');
} else {
    console.error('✗ targetPause not found');
}

// 4. W selectStation(): zatrzymaj ytPlayerBridge
const targetSelect = [
    '    // Reset audio when switching stations',
    '    audio.pause();',
    '    audio.removeAttribute(\'src\');',
    '    currentAudioUrl = "";'
].join(eol);

const replacementSelect = [
    '    // Reset audio when switching stations',
    '    if (ytPlayerBridge && typeof ytPlayerBridge.stopVideo === \'function\') {',
    '        try { ytPlayerBridge.stopVideo(); } catch(e) {}',
    '    }',
    '    audio.pause();',
    '    audio.removeAttribute(\'src\');',
    '    currentAudioUrl = "";'
].join(eol);

if (content.includes(targetSelect)) {
    content = content.replace(targetSelect, replacementSelect);
    console.log('✓ Replaced selectStation logic');
} else {
    console.error('✗ targetSelect not found');
}

// 5. Volume: przekaż głośność
const targetVol = [
    '    audio.volume = targetVol;',
    '    previousVolume = targetVol;',
    '    updateVolumeIcon(targetVol);'
].join(eol);

const replacementVol = [
    '    audio.volume = targetVol;',
    '    previousVolume = targetVol;',
    '    if (ytPlayerBridge && typeof ytPlayerBridge.setVolume === \'function\') {',
    '        try { ytPlayerBridge.setVolume(Math.round(targetVol * 100)); } catch(e) {}',
    '    }',
    '    updateVolumeIcon(targetVol);'
].join(eol);

if (content.includes(targetVol)) {
    content = content.replace(targetVol, replacementVol);
    console.log('✓ Replaced volume logic');
} else {
    console.error('✗ targetVol not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('app.js patched cleanly!');
