import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
    if (l.includes('--ticker-height') || l.includes('--dekalog-height') || l.includes('.channel-frame') || l.includes('ccn-master-ticker') || l.includes('dekalog-top-ticker')) {
        console.log(i + 1, l.trim());
    }
});
