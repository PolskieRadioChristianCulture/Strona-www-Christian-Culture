import fs from 'node:fs';

const akademiaPath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/akademia.html';
let content = fs.readFileSync(akademiaPath, 'utf8');

const card39 = `
          <!-- KARTA DZIEŃ 39 -->
          <a href="/akademia/kurscodzienny/dzien-39" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 39 • 8 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/30">
              <img src="/images/academy/daily/kc_day_39_plagi_zaby_muchy_nil.jpg?v=20261108" alt="Dzień 39: PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN (Wj 8:1–32)" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              PLAGI ŻAB, WSZY I MUCH — BOŻY PALEC I ROZRÓŻNIENIE ZIEMI GOSZEN
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Sąd nad bóstwami Heket i Geb, kapitulacja czarowników przed palcem Bożym, nienaruszona ziemia Goszen i odrzucenie kompromisów — Wj 8:1–32.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 8:1–32</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>
`;

if (!content.includes('dzien-39" class="group block')) {
  // Insert after dzien-38 card
  const d38End = content.indexOf('<!-- KARTA DZIEŃ 38 -->');
  if (d38End !== -1) {
    const nextAEnd = content.indexOf('</a>', d38End);
    if (nextAEnd !== -1) {
      const insertPos = nextAEnd + 4;
      content = content.slice(0, insertPos) + card39 + content.slice(insertPos);
      fs.writeFileSync(akademiaPath, content, 'utf8');
      console.log('SUCCESS: Dzień 39 card inserted into akademia.html');
    }
  }
} else {
  console.log('Dzień 39 card already present');
}
