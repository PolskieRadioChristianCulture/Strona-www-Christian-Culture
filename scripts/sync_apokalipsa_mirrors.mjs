import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc';
const DESKTOP_LUMINA = 'C:\\Users\\czark\\Desktop\\@ICC\\LUMINA';

const items = [
  'akademia/apokalipsa/lekcja-29.html',
  'akademia/apokalipsa/lekcja-29/index.html',
  'akademia/apokalipsa/lekcja-30.html',
  'akademia/apokalipsa/lekcja-30/index.html',
  'akademia/apokalipsa/lekcja-31.html',
  'akademia/apokalipsa/lekcja-31/index.html',
  'akademia.html'
];

// Copy to kursy/apokalipsa/
const apokFiles = [
  'lekcja-29.html',
  'lekcja-29/index.html',
  'lekcja-30.html',
  'lekcja-30/index.html',
  'lekcja-31.html',
  'lekcja-31/index.html',
];

for (const f of apokFiles) {
  const src = path.join(REPO, 'akademia', 'apokalipsa', f);
  const dst = path.join(REPO, 'kursy', 'apokalipsa', f);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log('Copied to kursy:', f);
}

// Copy akademia.html to kursy/index.html as well if kursy has it
if (fs.existsSync(path.join(REPO, 'kursy', 'index.html'))) {
  fs.copyFileSync(path.join(REPO, 'akademia.html'), path.join(REPO, 'kursy', 'index.html'));
}

// Copy all items to .pages-release and Desktop/@ICC/LUMINA
for (const item of items) {
  const src = path.join(REPO, item);
  if (fs.existsSync(src)) {
    // .pages-release
    const dstPages = path.join(REPO, '.pages-release', item);
    fs.mkdirSync(path.dirname(dstPages), { recursive: true });
    fs.copyFileSync(src, dstPages);

    // Desktop LUMINA
    const dstLumina = path.join(DESKTOP_LUMINA, item);
    fs.mkdirSync(path.dirname(dstLumina), { recursive: true });
    fs.copyFileSync(src, dstLumina);
  }
}

// Also sync kursy to .pages-release and LUMINA
for (const f of apokFiles) {
  const src = path.join(REPO, 'kursy', 'apokalipsa', f);
  const dstPages = path.join(REPO, '.pages-release', 'kursy', 'apokalipsa', f);
  fs.mkdirSync(path.dirname(dstPages), { recursive: true });
  fs.copyFileSync(src, dstPages);

  const dstLumina = path.join(DESKTOP_LUMINA, 'kursy', 'apokalipsa', f);
  fs.mkdirSync(path.dirname(dstLumina), { recursive: true });
  fs.copyFileSync(src, dstLumina);
}

console.log('✅ All mirrors synchronized successfully');
