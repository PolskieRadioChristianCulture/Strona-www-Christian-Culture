import fs from 'node:fs';
import path from 'node:path';

function fixFile(filePath, dayNum, prevDayNum, readingChapter) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Replace Strong header & description
  html = html.replace(/Kody Stronga \([^)]+\)/g, `Kody Stronga (Wj ${readingChapter})`);
  html = html.replace(/Klucze Językowe & Kody Stronga \(Wj \d+\)/g, `Klucze Językowe & Kody Stronga (Wj ${readingChapter})`);
  html = html.replace(/osnowę teologiczną \d+\. rozdziału/g, `osnowę teologiczną ${readingChapter}. rozdziału`);

  // Replace task Po przeczytaniu
  html = html.replace(/Po przeczytaniu Wj [0-9–:-]+/g, `Po przeczytaniu Wj ${readingChapter}`);
  html = html.replace(/Przeczytaj cały fragment <a href="\/mojabiblia\?book=[A-Z0-9]+&chapter=\d+"/g, `Przeczytaj cały fragment <a href="/mojabiblia?book=EXO&chapter=${readingChapter}"`);

  // Replace quiz title
  html = html.replace(/Pytań z Wj [0-9–:-]+/g, `Pytań z Wj ${readingChapter}`);

  // Replace Oznacz Dzień N
  html = html.replace(/Oznacz Dzień \d+ jako ukończony/g, `Oznacz Dzień ${dayNum} jako ukończony`);
  html = html.replace(/DAY_KEY = 'kc_day\d+'/g, `DAY_KEY = 'kc_day${dayNum}'`);

  // Replace share links dzien-XX
  html = html.replace(/kurscodzienny%2Fdzien-\d+/g, `kurscodzienny%2Fdzien-${dayNum}`);
  html = html.replace(/share=dzien-\d+&(?:amp;)?v=[^\d"]*\d+:/g, `share=dzien-${dayNum}&amp;v=Wj%20${readingChapter}:`);

  // Clean old day references
  const regexOld = new RegExp(`Dzień ${prevDayNum}`, 'g');
  const lines = html.split('\n');
  const fixedLines = lines.map((line) => {
    if (line.includes(`← Dzień ${prevDayNum}`) || line.includes(`dzien-${prevDayNum}`)) return line;
    if (line.includes(`Dzień ${prevDayNum}`)) {
      return line.replace(regexOld, `Dzień ${dayNum}`);
    }
    return line;
  });

  html = fixedLines.join('\n');
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('✅ Poprawiono:', filePath);
}

// Fix Day 45 files
const files45 = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-45/index.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-45/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-45/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-45.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-45/index.html'
];
files45.forEach(f => fixFile(f, 45, 44, 15));

// Fix Day 46 files
const files46 = [
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia/kurscodzienny/dzien-46/index.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/kursy/kurscodzienny/dzien-46/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/akademia/kurscodzienny/dzien-46/index.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-46.html',
  'C:/Users/czark/Desktop/@ICC/LUMINA/kursy/kurscodzienny/dzien-46/index.html'
];
files46.forEach(f => fixFile(f, 46, 45, 16));
