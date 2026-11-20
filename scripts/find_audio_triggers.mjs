import fs from 'fs';

const content = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/index.html', 'utf8');
const lines = content.split('\n');

console.log('--- Search playBtn ---');
lines.forEach((l, idx) => {
  if (l.includes('playBtn') || l.includes('playIcon') || l.includes('togglePlay') || l.includes('audioPlayer')) {
    console.log(`${idx + 1}: ${l.trim().substring(0, 120)}`);
  }
});
