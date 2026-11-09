import fs from 'node:fs';
const p = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/spiewajmy-panu-live.html';
let s = fs.readFileSync(p, 'utf8');
if (!s.includes("type: 'YT_PLAYER_READY'")) {
    s = s.replace('function onPlayerReady(event) {', 'function onPlayerReady(event) {\r\n            try { if (window.parent && window.parent !== window) { window.parent.postMessage({ type: \'YT_PLAYER_READY\' }, \'*\'); } } catch(e) {}');
    fs.writeFileSync(p, s, 'utf8');
    console.log('Added YT_PLAYER_READY to spiewajmy');
}
