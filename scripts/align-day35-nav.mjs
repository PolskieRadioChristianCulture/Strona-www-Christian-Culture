import fs from 'node:fs';

const files = [
  'akademia/kurscodzienny/dzien-35.html',
  'akademia/kurscodzienny/dzien-35/index.html',
  'kursy/kurscodzienny/dzien-35.html',
  'kursy/kurscodzienny/dzien-35/index.html'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  // Zastąp blok nawigacji wzorcem z Dnia 33
  content = content.replace(
    /<div class="flex items-center gap-2">\s*<a href="\/akademia\/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-\[32px\] flex items-center">Spis Dni<\/a>\s*<span class="text-zinc-700">\|<\/span>\s*<a href="\/akademia\/kurscodzienny\/dzien-34"[\s\S]*?<\/div>\s*<\/div>\s*<\/nav>/,
    `<div class="flex items-center gap-2">
        <a href="/akademia/kurscodzienny" class="text-zinc-400 hover:text-white px-2 py-1 min-h-[32px] flex items-center">Spis Dni</a>
        <span class="text-zinc-700">|</span>
        <a href="/akademia/kurscodzienny/dzien-34" class="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 min-h-[32px] flex items-center">← Dzień 34</a>
      </div>
    </div>
  </nav>`
  );
  fs.writeFileSync(f, content, 'utf8');
  console.log('✅ Zaktualizowano', f);
}
