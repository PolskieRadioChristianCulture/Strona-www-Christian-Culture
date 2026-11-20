import fs from 'fs';

const hubCode = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/js/cc-polonia-hub.js', 'utf8');
const lines = hubCode.split('\n');
console.log(lines.slice(135, 175).join('\n'));
