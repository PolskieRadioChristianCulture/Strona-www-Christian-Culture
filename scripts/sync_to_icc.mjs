import fs from 'fs';
import path from 'path';

const SRC = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const DST = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const files = [
    'master-live.html',
    'zapolske-live.html',
    'js/cc-polonia-hub.js'
];

files.forEach(f => {
    const s = path.join(SRC, f);
    const d = path.join(DST, f);
    fs.mkdirSync(path.dirname(d), { recursive: true });
    fs.copyFileSync(s, d);
    console.log(`Copied ${f} -> ${DST}`);
});
