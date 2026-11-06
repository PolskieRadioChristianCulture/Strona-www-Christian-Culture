import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const destFile = path.join(ROOT, 'akademia/kurscodzienny/dzien-37.html');

let html = fs.readFileSync(destFile, 'utf8');

// Replace main introduction paragraph
html = html.replace(
  /<p class="lead text-gray-300[^>]*>[\s\S]*?<\/p>/,
  `<p class="lead text-gray-300 text-lg sm:text-xl font-light leading-relaxed mb-6">
    Szósty rozdział Księgi Wyjścia ukazuje przełomowy moment w dziejach zbawienia: gdy po ludzku wszystko zdaje się stracone, a udręka ucisku paraliżuje serca, Bóg objawia pełnię swojego Imienia JAHWE i składa siedem niezłomnych obietnic odkupienia. Zbawienie nie zależy od ludzkiej siły ani od łatwości okoliczności, lecz od suwerennego przymierza i wyciągniętego ramienia Boga, które w ostateczny sposób objawiło się w Jezusie Chrystusie.
  </p>`
);

fs.writeFileSync(destFile, html, 'utf8');
console.log('✔ Enriched introduction.');
