import fs from 'node:fs';

const files8 = [
  'akademia.html', 'akademia/index.html',
  'akademia/kurscodzienny.html', 'akademia/kurscodzienny/index.html',
  'kursy.html', 'kursy/index.html',
  'kursy/kurscodzienny.html', 'kursy/kurscodzienny/index.html'
];

for (const f of files8) {
  let c = fs.readFileSync(f, 'utf8');
  
  // Hero button primary: Day 35 -> Day 36
  c = c.replaceAll('/akademia/kurscodzienny/dzien-35"', '/akademia/kurscodzienny/dzien-36"');
  c = c.replaceAll('CZYTAJ DZIEŃ 35 (4 LISTOPADA)', 'CZYTAJ DZIEŃ 36 (5 LISTOPADA)');
  
  // Secondary back button: Day 34 -> Day 35
  c = c.replace(
    /href="\/akademia\/kurscodzienny\/dzien-34" class="cin-btn-secondary/g,
    'href="/akademia/kurscodzienny/dzien-35" class="cin-btn-secondary'
  );
  c = c.replace(
    /href="\/kursy\/kurscodzienny\/dzien-34" class="cin-btn-secondary/g,
    'href="/kursy/kurscodzienny/dzien-35" class="cin-btn-secondary'
  );
  c = c.replaceAll('<span>← DZIEŃ 34</span>', '<span>← DZIEŃ 35</span>');

  // Badge / count
  c = c.replaceAll('29 LEKCJI', '36 LEKCJI');
  c = c.replaceAll('35 LEKCJI', '36 LEKCJI');
  c = c.replaceAll('Dni 1–35 z 365 Dostępne', 'Dni 1–36 z 365 Dostępne');
  c = c.replaceAll('(4 Listopada 2026)', '(5 Listopada 2026)');
  
  fs.writeFileSync(f, c, 'utf8');
  console.log('Updated:', f);
}
console.log('Done — 8 catalog files updated for Day 36.');
