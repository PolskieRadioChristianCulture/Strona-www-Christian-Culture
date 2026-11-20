import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');
const start = html.indexOf('function injectChatOverlay');
if (start !== -1) {
    console.log(html.substring(start, start + 1200));
} else {
    console.log('injectChatOverlay not found');
}
