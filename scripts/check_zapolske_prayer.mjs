import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/zapolske-live.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
    if (l.includes('livePrayerOverlay') || l.includes('ccLiveViewerChat')) {
        console.log(i + 1, l.trim());
    }
});
