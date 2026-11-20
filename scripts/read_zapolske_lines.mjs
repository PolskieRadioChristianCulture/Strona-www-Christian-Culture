import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/zapolske-live.html', 'utf8');
const lines = html.split('\n');
console.log(lines.slice(1740, 1765).join('\n'));
