import fs from 'node:fs';
import path from 'node:path';

const REPO = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const MIRROR = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const COPIES = [
  path.join(REPO, 'akademia/kurscodzienny/dzien-33.html'),
  path.join(REPO, 'akademia/kurscodzienny/dzien-33/index.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-33.html'),
  path.join(REPO, 'kursy/kurscodzienny/dzien-33/index.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-33.html'),
  path.join(MIRROR, 'akademia/kurscodzienny/dzien-33/index.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-33.html'),
  path.join(MIRROR, 'kursy/kurscodzienny/dzien-33/index.html'),
];

const targetPattern = /<a href="\/akademia\/kurscodzienny\/dzien-32" class="px-2\.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-\[32px\] flex items-center">← Dzień 32<\/a>/;

const replacement = `<a href="/akademia/kurscodzienny/dzien-32" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 32</a>
        <a href="/akademia/kurscodzienny/dzien-34" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 34 →</a>`;

for (const p of COPIES) {
  let content = fs.readFileSync(p, 'utf8');
  if (!content.includes('/kurscodzienny/dzien-34"')) {
    if (!targetPattern.test(content)) {
      console.error('Target pattern not found in:', p);
      process.exit(1);
    }
    content = content.replace(targetPattern, replacement);
    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated Day 33 link to Day 34 in:', p);
  } else {
    console.log('Already contains link in:', p);
  }
}
