import fs from 'node:fs';
import path from 'node:path';

const files = [
  'akademia/kurscodzienny/dzien-37.html',
  'akademia/kurscodzienny/dzien-37/index.html',
  'kursy/kurscodzienny/dzien-37.html',
  'kursy/kurscodzienny/dzien-37/index.html',
];

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');

  // 1. Navigation back button text
  html = html.replaceAll('<span>← Dzień 35</span>', '<span>← Dzień 36</span>');

  // 2. Share links
  html = html.replaceAll('Dzie%C5%84%2036', 'Dzie%C5%84%2037');
  html = html.replaceAll('Pierwsza%20konfrontacja%20z%20faraonem%20i%20pr%C3%B3ba%20wiary', 'Teraz%20zobaczysz%2C%20co%20uczyni%C4%99%20faraonowi%20%E2%80%94%20siedem%20obietnic%20odkupienia');

  // 3. Strong & Bible chapter references
  html = html.replaceAll('osnowę teologiczną 5. rozdziału', 'osnowę teologiczną 6. rozdziału');
  html = html.replaceAll('osnowę teologiczną 05. rozdziału', 'osnowę teologiczną 6. rozdziału');
  html = html.replaceAll('chapter=5"', 'chapter=6"');
  html = html.replaceAll('chapter=05"', 'chapter=6"');
  html = html.replaceAll('Po przeczytaniu Wj 5', 'Po przeczytaniu Wj 6');
  html = html.replaceAll('Pytań z Wj 5', 'Pytań z Wj 6');
  html = html.replaceAll('Kody Stronga (Wj 5', 'Kody Stronga (Wj 6');
  html = html.replaceAll('(UBG) • Wj 5', '(UBG) • Wj 6');
  html = html.replaceAll('Czytanie: Wj 5', 'Czytanie: Wj 6');

  // 4. LocalStorage keys
  html = html.replaceAll('kc_day36_quiz', 'kc_day37_quiz');
  html = html.replaceAll('kc_day36_completed', 'kc_day37_completed');
  html = html.replaceAll("DAY_KEY = 'kc_day36'", "DAY_KEY = 'kc_day37'");
  html = html.replaceAll("DAY_KEY = 'kc_day_36'", "DAY_KEY = 'kc_day37'");
  html = html.replaceAll('kc_day36', 'kc_day37');

  // 5. Button label and alt
  html = html.replaceAll('Oznacz Dzień 36 jako ukończony', 'Oznacz Dzień 37 jako ukończony');
  html = html.replaceAll('Dzień 36 z 2009', 'Dzień 37 z 2009');
  html = html.replaceAll('alt="Dzień 36:', 'alt="Dzień 37:');

  // 6. Share verse parameter
  html = html.replaceAll('share=dzien-36', 'share=dzien-37');

  fs.writeFileSync(file, html, 'utf8');
  console.log('Fixed:', file);
}
