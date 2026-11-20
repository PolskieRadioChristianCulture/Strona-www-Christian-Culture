import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/master-live.html', 'utf8');
const lines = html.split('\n');
console.log('Lines around 840-860:');
console.log(lines.slice(835, 865).join('\n'));
