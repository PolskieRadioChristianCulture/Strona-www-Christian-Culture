import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const LUMINA_ROOT = 'C:/Users/czark/Desktop/@ICC/LUMINA';

const files = [
  path.join(ROOT, 'akademia/kurscodzienny/dzien-31.html'),
  path.join(ROOT, 'akademia/kurscodzienny/dzien-31/index.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-31.html'),
  path.join(ROOT, 'kursy/kurscodzienny/dzien-31/index.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-31.html'),
  path.join(LUMINA_ROOT, 'akademia/kurscodzienny/dzien-31/index.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-31.html'),
  path.join(LUMINA_ROOT, 'kursy/kurscodzienny/dzien-31/index.html')
];

for (const fp of files) {
  if (fs.existsSync(fp)) {
    let html = fs.readFileSync(fp, 'utf8');
    if (!html.includes('href="/akademia/kurscodzienny/dzien-32" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400')) {
      html = html.replace(
        '<a href="/akademia/kurscodzienny/dzien-30" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 30</a>',
        '<a href="/akademia/kurscodzienny/dzien-30" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 30</a>\n        <a href="/akademia/kurscodzienny/dzien-32" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 hover:text-amber-300 min-h-[32px] flex items-center font-bold">Dzień 32 →</a>'
      );
      fs.writeFileSync(fp, html, 'utf8');
    }
  }
}
console.log('✅ Zaktualizowano nawigację górną w Dniu 31.');
