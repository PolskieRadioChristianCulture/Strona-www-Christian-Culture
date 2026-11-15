import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('data/ekocc_kalendarz_365_artykulow.json', 'utf8'));
const today = '2026-11-15';

console.log('=== ARTYKUŁY 1-25 ===');
data.artykuly.slice(0, 25).forEach(x => {
  console.log(`${x.lp}. [${x.data_publikacji}] Prio:${x.priorytet} Start:${x.start_przygotowania} Status:${x.status} | ${x.tytul}`);
});

console.log('\n=== POZYCJE Z PRIORYTETEM A (start <= 2026-11-15 oraz data_pub >= 2026-11-15) ===');
data.artykuly.filter(x => x.priorytet === 'A' && x.start_przygotowania <= today && x.data_publikacji >= today).forEach(x => {
  console.log(`[Prio A] Lp:${x.lp} Pub:${x.data_publikacji} Start:${x.start_przygotowania} Status:${x.status} | ${x.tytul} (${x.portal_docelowy})`);
});

console.log('\n=== POZYCJE Z PRIORYTETEM B (start <= 2026-11-15 oraz data_pub >= 2026-11-15) ===');
data.artykuly.filter(x => x.priorytet === 'B' && x.start_przygotowania <= today && x.data_publikacji >= today).forEach(x => {
  console.log(`[Prio B] Lp:${x.lp} Pub:${x.data_publikacji} Start:${x.start_przygotowania} Status:${x.status} | ${x.tytul} (${x.portal_docelowy})`);
});
