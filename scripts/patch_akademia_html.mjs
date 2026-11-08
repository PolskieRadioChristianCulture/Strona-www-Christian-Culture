import fs from 'node:fs';

const filePath = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\akademia.html';
let content = fs.readFileSync(filePath, 'utf8');

// Update intro counts
content = content.replace(
  'Każda z 29 lekcji zawiera pełne studium biblijne',
  'Każda z 31 lekcji zawiera pełne studium biblijne'
);
content = content.replace(
  '<span>✓ 29 dedykowanych podstron</span>',
  '<span>✓ 31 dedykowanych podstron</span>'
);
content = content.replace(
  '<span>✓ Podcast Spotify (29 odc.)</span>',
  '<span>✓ Podcast Spotify (31 odc.)</span>'
);
content = content.replace(
  'Kompletny 29-odcinkowy cykl wykładów biblijnych',
  'Kompletny 31-odcinkowy cykl wykładów biblijnych'
);

// Update Lekcja 29 card (remove PREMIERA, set 29 / 31)
content = content.replace(
  '<span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 29 / 29</span>\n        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>',
  '<span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 29 / 31</span>'
);
// In case of CRLF
content = content.replace(
  '<span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 29 / 29</span>\r\n        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>',
  '<span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 29 / 31</span>'
);

// Insert cards for Lekcja 30 and 31
const newCards = `    <a href="/akademia/apokalipsa/lekcja-30" class="group block p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/50 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 30 / 31</span>
      </div>
      <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
        UPADŁ WIELKI BABILON — TAJEMNICA SZKARŁATNEJ KOBIETY
      </h3>
      <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">Apokalipsa 17:1–6 — Sąd nad wielką wszetecznicą, kielich obrzydliwości i demaskacja duchowego zwiedzenia</p>
      <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-zinc-500 flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
          <span>Ap 17:1–6; Jer 51:7; Rdz 11:1–9</span>
        </span>
        <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Studiuj</span>
          <span>→</span>
        </span>
      </div>
    </a>
    <a href="/akademia/apokalipsa/lekcja-31" class="group block p-5 rounded-2xl bg-[#0E121A] border border-white/10 hover:border-amber-500/50 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col">
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="font-display text-xs font-bold text-brand-gold tracking-widest">LEKCJA 31 / 31</span>
        <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">PREMIERA</span>
      </div>
      <h3 class="font-serif font-bold text-white text-base sm:text-lg mb-1 leading-snug group-hover:text-amber-300 transition-colors">
        ÓSMY KRÓL — PRZEPOWIEDNIA DLA NASZYCH CZASÓW
      </h3>
      <p class="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">Apokalipsa 17:7–18 — Tajemnica zwierzęcia, które było, nie ma go i znowu będzie oraz zwycięstwo Baranka</p>
      <div class="mt-auto pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-zinc-500 flex items-center gap-1.5">
          <i class="fa-solid fa-book-open text-brand-gold text-[10px]"></i>
          <span>Ap 17:7–18; Dn 7:7–25; Ap 13:1–3</span>
        </span>
        <span class="font-bold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>Studiuj</span>
          <span>→</span>
        </span>
      </div>
    </a>`;

// Find where lekcja-29 ends (before </div>\n      </section>\n\n    </main>)
const lekcja29EndTag = '    </a>\n        </div>\n      </section>';
const lekcja29EndTagCrlf = '    </a>\r\n        </div>\r\n      </section>';

if (content.includes(lekcja29EndTag)) {
  content = content.replace(lekcja29EndTag, `    </a>\n${newCards}\n        </div>\n      </section>`);
  console.log('✅ Replaced LF style');
} else if (content.includes(lekcja29EndTagCrlf)) {
  content = content.replace(lekcja29EndTagCrlf, `    </a>\r\n${newCards.replace(/\n/g, '\r\n')}\r\n        </div>\r\n      </section>`);
  console.log('✅ Replaced CRLF style');
} else {
  console.log('Searching for index of lekcja-29...');
  const idx = content.indexOf('/akademia/apokalipsa/lekcja-29');
  if (idx !== -1) {
    const endA = content.indexOf('</a>', idx);
    const afterA = endA + 4;
    content = content.slice(0, afterA) + '\n' + newCards + content.slice(afterA);
    console.log('✅ Inserted after lekcja-29 </a>');
  } else {
    console.error('❌ Could not locate lekcja-29 card in akademia.html');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ akademia.html patched successfully');
