import fs from 'node:fs';

const files8 = [
  'akademia.html', 'akademia/index.html',
  'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html',
  'kursy.html', 'kursy/index.html',
  'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html'
];

for (const f of files8) {
  let c = fs.readFileSync(f, 'utf8');
  
  // Hero button primary: Day 36 -> Day 37
  c = c.replaceAll('/akademia/kurscodzienny/dzien-36"', '/akademia/kurscodzienny/dzien-37"');
  c = c.replaceAll('CZYTAJ DZIEŃ 36 (5 LISTOPADA)', 'CZYTAJ DZIEŃ 37 (6 LISTOPADA)');
  c = c.replaceAll('CZYTAJ DZIEŃ 36 (05 LISTOPADA)', 'CZYTAJ DZIEŃ 37 (6 LISTOPADA)');
  
  // Secondary back button: Day 35 -> Day 36
  c = c.replace(
    /href="\/akademia\/kurscodzienny\/dzien-35" class="cin-btn-secondary/g,
    'href="/akademia/kurscodzienny/dzien-36" class="cin-btn-secondary'
  );
  c = c.replace(
    /href="\/kursy\/kurscodzienny\/dzien-35" class="cin-btn-secondary/g,
    'href="/kursy/kurscodzienny/dzien-36" class="cin-btn-secondary'
  );
  c = c.replaceAll('<span>← DZIEŃ 35</span>', '<span>← DZIEŃ 36</span>');

  // Badge / count
  c = c.replaceAll('36 LEKCJI', '37 LEKCJI');
  c = c.replaceAll('Dni 1–36 z 365 Dostępne', 'Dni 1–37 z 365 Dostępne');
  c = c.replaceAll('(5 Listopada 2026)', '(6 Listopada 2026)');
  c = c.replaceAll('(5 listopada 2026)', '(6 listopada 2026)');
  
  fs.writeFileSync(f, c, 'utf8');
  console.log('Updated:', f);
}
console.log('Done — 8 catalog files updated for Day 37.');
