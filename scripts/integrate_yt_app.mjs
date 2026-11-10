import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/app.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Dodaj youtubePlaylistId do radio_cc_women w STATIONS
const targetStation = `    radio_cc_women: {
        id: "radio_cc_women",
        name: "RADIO CC WOMEN",
        shortName: "CCW",
        tagline: "Miejsce Kobiet Takich Jak Ty",
        streamUrl: "",
        accentColors: ["#E83F94", "#FF75B5"],`;

const replacementStation = `    radio_cc_women: {
        id: "radio_cc_women",
        name: "RADIO CC WOMEN",
        shortName: "CCW",
        tagline: "Miejsce Kobiet Takich Jak Ty",
        streamUrl: "",
        youtubePlaylistId: "PLPkpY3wBciWM",
        accentColors: ["#E83F94", "#FF75B5"],`;

if (content.includes(targetStation)) {
    content = content.replace(targetStation, replacementStation);
    console.log('✓ Added youtubePlaylistId to STATIONS');
} else {
    console.log('Target station not found or already updated');
}

// 2. Dodaj obsługę YouTube Audio Bridge w app.js
const ytBridgeCode = `
// ── YOUTUBE AUDIO ENGINE DLA STACJI PLAYLISTOWYCH (np. Radio CC Women) ──
let ytPlayerBridge = null;
let ytBridgeReady = false;
let ytPendingPlay = false;

function initYtBridge() {
    if (ytPlayerBridge || typeof document === 'undefined') return;
    
    let host = document.getElementById('yt-audio-worker');
    if (!host) {
        host = document.createElement('div');
        host.id = 'yt-audio-worker';
        host.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
        document.body.appendChild(host);
    }

    function createPlayer() {
        if (!window.YT || !window.YT.Player) return;
        ytPlayerBridge = new window.YT.Player('yt-audio-worker', {
            height: '1',
            width: '1',
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                rel: 0
            },
            events: {
                onReady: () => {
                    ytBridgeReady = true;
                    if (ytPendingPlay && activeStation && activeStation.youtubePlaylistId) {
                        ytPendingPlay = false;
                        playRadio();
                    }
                },
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        isPlaying = true;
                        updatePlayerUI(true);
                        playerStatusText.textContent = "Odtwarza (YouTube)";
                        try {
                            const data = ytPlayerBridge.getVideoData();
                            if (data && data.title) {
                                playerTrackTitle.textContent = \`\${activeStation.name} — \${data.title}\`;
                            }
                        } catch(e) {}
                    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                        if (activeStation && activeStation.youtubePlaylistId) {
                            isPlaying = false;
                            updatePlayerUI(false);
                            playerStatusText.textContent = "Zatrzymany";
                        }
                    }
                },
                onError: () => {
                    if (activeStation && activeStation.youtubePlaylistId) {
                        isPlaying = false;
                        updatePlayerUI(false);
                        playerStatusText.textContent = "Błąd odtwarzania YouTube";
                    }
                }
            }
        });
    }

    if (window.YT && window.YT.Player) {
        createPlayer();
    } else {
        const prevInit = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof prevInit === 'function') prevInit();
            createPlayer();
        };
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }
    }
}
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initYtBridge);
    } else {
        initYtBridge();
    }
}
`;

// Wstawienie przed funkcją playRadio
const playRadioTarget = `function playRadio() {`;
if (content.includes(playRadioTarget) && !content.includes('initYtBridge')) {
    content = content.replace(playRadioTarget, ytBridgeCode + '\n' + playRadioTarget);
    console.log('✓ Inserted YouTube audio bridge into app.js');
}

// 3. Obsługa w playRadio(): jeśli activeStation.youtubePlaylistId
const targetPlayCheck = `    if (!targetUrl) {
        audio.pause();
        audio.removeAttribute('src');
        currentAudioUrl = "";
        playerTrackTitle.textContent = \`\${activeStation.name} — \${activeStation.tagline || 'Wkrótce emisja 24/7'}\`;
        playerStatusText.textContent = "Oczekuje na emisję";
        isPlaying = false;
        updatePlayerUI(false);
        return;
    }`;

const replacementPlayCheck = `    if (activeStation && activeStation.youtubePlaylistId) {
        audio.pause();
        audio.removeAttribute('src');
        currentAudioUrl = "";
        if (!ytBridgeReady || !ytPlayerBridge) {
            ytPendingPlay = true;
            playerStatusText.textContent = "Ładowanie YouTube…";
            initYtBridge();
            return;
        }
        playerStatusText.textContent = "Ładowanie playlisty…";
        ytPlayerBridge.loadPlaylist({
            list: activeStation.youtubePlaylistId,
            listType: 'playlist',
            index: 0,
            startSeconds: 0
        });
        isPlaying = true;
        updatePlayerUI(true);
        return;
    }

    if (!targetUrl) {
        audio.pause();
        audio.removeAttribute('src');
        currentAudioUrl = "";
        playerTrackTitle.textContent = \`\${activeStation.name} — \${activeStation.tagline || 'Wkrótce emisja 24/7'}\`;
        playerStatusText.textContent = "Oczekuje na emisję";
        isPlaying = false;
        updatePlayerUI(false);
        return;
    }`;

if (content.includes(targetPlayCheck)) {
    content = content.replace(targetPlayCheck, replacementPlayCheck);
    console.log('✓ Updated playRadio with YouTube playlist support');
}

// 4. Obsługa w pauseRadio(): zatrzymaj także ytPlayerBridge
const targetPauseRadio = `function pauseRadio() {
    isPlaying = false;
    updatePlayerUI(false);
    playerStatusText.textContent = "Zatrzymany";
    stopFade();
    audio.pause();`;

const replacementPauseRadio = `function pauseRadio() {
    isPlaying = false;
    updatePlayerUI(false);
    playerStatusText.textContent = "Zatrzymany";
    stopFade();
    if (ytPlayerBridge && typeof ytPlayerBridge.pauseVideo === 'function') {
        try { ytPlayerBridge.pauseVideo(); } catch(e) {}
    }
    audio.pause();`;

if (content.includes(targetPauseRadio)) {
    content = content.replace(targetPauseRadio, replacementPauseRadio);
    console.log('✓ Updated pauseRadio with YouTube pause support');
}

// 5. Obsługa w stopRadio / selectStation: zatrzymaj YouTube przy zmianie stacji
const targetSelectStation = `    // Reset audio when switching stations
    audio.pause();
    audio.removeAttribute('src');
    currentAudioUrl = "";`;

const replacementSelectStation = `    // Reset audio when switching stations
    if (ytPlayerBridge && typeof ytPlayerBridge.stopVideo === 'function') {
        try { ytPlayerBridge.stopVideo(); } catch(e) {}
    }
    audio.pause();
    audio.removeAttribute('src');
    currentAudioUrl = "";`;

if (content.includes(targetSelectStation)) {
    content = content.replace(targetSelectStation, replacementSelectStation);
    console.log('✓ Updated selectStation with YouTube stop support');
}

// 6. Głośność: przekaż do YouTube
const targetVolume = `    audio.volume = targetVol;
    previousVolume = targetVol;
    updateVolumeIcon(targetVol);`;

const replacementVolume = `    audio.volume = targetVol;
    previousVolume = targetVol;
    if (ytPlayerBridge && typeof ytPlayerBridge.setVolume === 'function') {
        try { ytPlayerBridge.setVolume(Math.round(targetVol * 100)); } catch(e) {}
    }
    updateVolumeIcon(targetVol);`;

if (content.includes(targetVolume)) {
    content = content.replace(targetVolume, replacementVolume);
    console.log('✓ Updated volume handler with YouTube volume support');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('app.js updated successfully!');
