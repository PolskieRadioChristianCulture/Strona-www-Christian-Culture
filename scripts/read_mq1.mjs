import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(465, 495).join('\n'));
