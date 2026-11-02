import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const akPath = path.join(ROOT, 'akademia.html');
let html = fs.readFileSync(akPath, 'utf8');

const card32 = `
          <!-- KARTA DZIEŃ 32 -->
          <a href="/akademia/kurscodzienny/dzien-32" class="group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30">
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="font-display text-xs font-bold text-brand-gold tracking-widest">DZIEŃ 32 • 1 LISTOPADA 2026</span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>
            </div>
            <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 border border-brand-gold/20">
              <img src="/images/academy/daily/kc_day_32_ucisk_w_egipcie_odwaga_poloznych.jpg?v=20261102" alt="Dzień 32: W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE — Wj 1:1–22" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 block opacity-90 group-hover:opacity-100" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent opacity-80"></div>
            </div>
            <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
              W NIESKRĘPOWANYM ROZROŚCIE: NOWY KRÓL, UCIEMIĘŻENIE I BOŻE OCALENIE
            </h3>
            <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
              Księga Wyjścia: nowy faraon, niewola Izraela, heroiczna wiara położnych Szifry i Pui oraz Boże ocalenie życia — Wj 1:1–22.
            </p>
            <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span class="text-zinc-500 flex items-center gap-1.5">
                <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
                <span>Wj 1:1–22</span>
              </span>
              <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Studiuj</span>
                <span>→</span>
              </span>
            </div>
          </a>`;

if (!html.includes('href="/akademia/kurscodzienny/dzien-32"')) {
  const d31Pos = html.indexOf('<!-- KARTA DZIEŃ 31 -->');
  if (d31Pos !== -1) {
    const afterD31 = html.indexOf('</a>', d31Pos);
    if (afterD31 !== -1) {
      html = html.slice(0, afterD31 + 4) + '\n' + card32 + html.slice(afterD31 + 4);
      fs.writeFileSync(akPath, html, 'utf8');
      console.log('✅ Wstawiono KARTA DZIEŃ 32 do akademia.html');
    }
  }
} else {
  console.log('ℹ️ Karta Dnia 32 już istnieje w akademia.html');
}
