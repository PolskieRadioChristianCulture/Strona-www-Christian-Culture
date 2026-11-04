import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const COPIES = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-34.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-34/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-34.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-34/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-34.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-34/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-34.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-34/index.html'),
];

for (const p of COPIES) {
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');

  // Replace disabled Day 35 span in top nav with active link
  content = content.replace(
    /<span class="px-3 py-1\.5 rounded-lg bg-white\/5 text-xs text-zinc-500 flex items-center gap-1\.5 opacity-50 cursor-not-allowed min-h-\[44px\]">[\s\S]*?<span>Dzień 35 \(Jutro\) →<\/span>[\s\S]*?<\/span>/,
    `<a href="/akademia/kurscodzienny/dzien-35" class="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1.5 min-h-[44px]">
          <span>Dzień 35 →</span>
          <i class="fa-solid fa-chevron-right text-[10px]"></i>
        </a>`
  );

  // In #jutro section, add link to Day 35
  content = content.replace(
    /<div class="flex items-center gap-3 flex-wrap">[\s\S]*?← Wróć do spisu kursu[\s\S]*?<\/div>/,
    `<div class="flex items-center gap-3 flex-wrap">
        <a href="/akademia/kurscodzienny/dzien-35" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 text-xs font-extrabold uppercase tracking-wider hover:from-amber-400 hover:to-amber-500 transition shadow-lg min-h-[44px] flex items-center gap-2">
          <span>Czytaj Dzień 35 →</span>
          <i class="fa-solid fa-arrow-right text-[11px]"></i>
        </a>
        <a href="/akademia/kurscodzienny" class="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 hover:text-white text-xs font-bold transition min-h-[44px] flex items-center">
          ← Wróć do spisu kursu
        </a>
      </div>`
  );

  fs.writeFileSync(p, content, 'utf8');
  console.log(`Updated Day 34 link to Day 35 in: ${p}`);
}
