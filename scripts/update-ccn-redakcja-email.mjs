import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';

function updateFile(relPath, replacements) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn('File not found:', relPath);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replaceAll(from, to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('✔ Updated:', relPath);
  } else {
    console.log('ℹ No changes needed in:', relPath);
  }
}

// 1. CCN News
updateFile('portals/ccn-news/src/components/Footer.tsx', [
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"'],
  ['polskiercctv@gmail.com', 'redakcjaccn@gmail.com'],
  ['radiochristianculture@gmail.com', 'redakcjaccn@gmail.com']
]);

updateFile('portals/ccn-news/src/main.tsx', [
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"']
]);

// 2. CCN Finanse
updateFile('portals/ccn-finanse/src/components/Footer.tsx', [
  ['href="mailto:radiochristianculture@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"'],
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"'],
  ['radiochristianculture@gmail.com', 'redakcjaccn@gmail.com'],
  ['polskiercctv@gmail.com', 'redakcjaccn@gmail.com']
]);

updateFile('portals/ccn-finanse/src/main.tsx', [
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"']
]);

updateFile('portals/ccn-finanse/index.html', [
  ['W razie pytań napisz: radiochristianculture@gmail.com.', 'W razie pytań napisz: redakcjaccn@gmail.com.']
]);

// 3. CCN Music
updateFile('portals/ccn-music/src/App.tsx', [
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"']
]);

// 4. Kultura
updateFile('portals/kultura/components/Footer.tsx', [
  ['href="mailto:polskiercctv@gmail.com"', 'href="mailto:redakcjaccn@gmail.com"'],
  ['polskiercctv@gmail.com', 'redakcjaccn@gmail.com']
]);

updateFile('portals/kultura/components/TopNewsTicker.tsx', [
  ['Kontakt: radiochristianculture@gmail.com', 'Kontakt: redakcjaccn@gmail.com']
]);

['en', 'es', 'pl'].forEach(lang => {
  updateFile(`portals/kultura/locales/${lang}/translation.json`, [
    ['radiochristianculture@gmail.com', 'redakcjaccn@gmail.com']
  ]);
});

// 5. Thematic portal HTML files
const thematicFiles = [
  'nauka.html', 'nauka/index.html',
  'historia.html', 'historia/index.html',
  'prawo.html', 'prawo/index.html',
  'biologia.html', 'biologia/index.html',
  'seks.html', 'seks/index.html',
  'finanse.html', 'finanse/index.html',
  'kultura.html', 'kultura/index.html',
  'apologetyka.html', 'apologetyka/index.html',
  'biblioteka.html', 'biblioteka/index.html',
  'biznes.html', 'biznes/index.html',
  'edukacja.html', 'edukacja/index.html',
  'kuchnia.html', 'kuchnia/index.html',
  'misje.html', 'misje/index.html'
];

for (const tf of thematicFiles) {
  updateFile(tf, [
    ['radiochristianculture@gmail.com', 'redakcjaccn@gmail.com'],
    ['polskiercctv@gmail.com', 'redakcjaccn@gmail.com']
  ]);
}

// 6. Test file ccn-owner-requirements.test.mjs
updateFile('scripts/ccn-owner-requirements.test.mjs', [
  ["assert.ok(read('components/Footer.tsx').includes('polskiercctv@gmail.com'));", "assert.ok(read('components/Footer.tsx').includes('redakcjaccn@gmail.com'));assert.ok(!read('components/Footer.tsx').includes('polskiercctv@gmail.com'));"]
]);

console.log('\n🎉 Wszystkie pliki z grupy CCN zaktualizowane o adres redakcjaccn@gmail.com.');
