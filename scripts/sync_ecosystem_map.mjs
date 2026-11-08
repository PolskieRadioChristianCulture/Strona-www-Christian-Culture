import fs from 'node:fs';
import path from 'node:path';

const src = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\data\\ecosystem-map.json';
const dstPages = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\.pages-release\\data\\ecosystem-map.json';
const dstLumina = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA\\data\\ecosystem-map.json';

fs.mkdirSync(path.dirname(dstPages), { recursive: true });
fs.copyFileSync(src, dstPages);
fs.mkdirSync(path.dirname(dstLumina), { recursive: true });
fs.copyFileSync(src, dstLumina);
console.log('✅ ecosystem-map.json mirrored to pages release and desktop lumina');
