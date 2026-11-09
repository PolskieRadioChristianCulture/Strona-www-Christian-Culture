import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/spiewajmy-panu-live.html';
let content = fs.readFileSync(filePath, 'utf8');

// onPlayerStateChange hook
const playingTarget = `            if (event.data === YT.PlayerState.PLAYING) {
                disableCaptions();
                updateTrackMetadata();`.replace(/\n/g, '\r\n');

const playingReplacement = `            if (event.data === YT.PlayerState.PLAYING) {
                disableCaptions();
                updateTrackMetadata();
                try {
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({ type: 'YT_PLAYER_PLAYING' }, '*');
                    }
                } catch(e) {}`.replace(/\n/g, '\r\n');

if (!content.includes("type: 'YT_PLAYER_PLAYING'")) {
    if (content.includes(playingTarget)) {
        content = content.replace(playingTarget, playingReplacement);
    } else {
        // Fallback for LF
        content = content.replace(playingTarget.replace(/\r\n/g, '\n'), playingReplacement.replace(/\r\n/g, '\n'));
    }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed onPlayerStateChange in spiewajmy-panu-live.html');
