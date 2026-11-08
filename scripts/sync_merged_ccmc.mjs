import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const DESKTOP_LUMINA = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';

const files = [
  'ccMC/index.html',
  'ccMC/style.css',
  'ccMC/app.js'
];

for (const f of files) {
  const src = path.join(REPO, f);
  const dstPages = path.join(REPO, '.pages-release', f);
  const dstLumina = path.join(DESKTOP_LUMINA, f);
  
  fs.mkdirSync(path.dirname(dstPages), { recursive: true });
  fs.copyFileSync(src, dstPages);
  
  fs.mkdirSync(path.dirname(dstLumina), { recursive: true });
  fs.copyFileSync(src, dstLumina);
}

console.log('✅ ccMC mirrors updated with merged voice report fixes');
