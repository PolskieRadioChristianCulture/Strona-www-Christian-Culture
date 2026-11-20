import fs from 'fs';

const html = fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/zapolske-live.html', 'utf8');
const lines = html.split('\n');

lines.forEach((l, i) => {
    if (l.includes('SŁOWO WPROWADZENIA') || l.includes('slowo-wprowadzenia') || l.includes('Duchowy Horyzont') || l.includes('breakfast-accent') || l.includes('intro') || l.includes('reflection') || l.includes('right')) {
        if (l.includes('style') || l.includes('class') || l.includes('bottom') || l.includes('top') || l.includes('id=')) {
            console.log(i + 1, l.trim());
        }
    }
});
