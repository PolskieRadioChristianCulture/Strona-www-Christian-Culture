#!/usr/bin/env node
// Zmiana nazwy „Herbatka między słowami” → „Herbaciarnia Między Słowami” (polecenie Dowódcy 2026-11-08).
// Hasła typu „z herbatką między słowami” (slogan, narzędnik) pozostają bez zmian.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const NEW = 'Herbaciarnia Między Słowami';

const rules = [
  // Logo w nagłówku i stopce aplikacji /herbatka (pakiet Vite)
  [/\[`Herbatka `,\(0,(\w+)\.jsx\)\(`span`,\{children:`między słowami`\}\)\]/g, '[`Herbaciarnia `,(0,$1.jsx)(`span`,{children:`Między Słowami`})]'],
  // Tytuły z dopiskiem
  [/Herbatka między słowami – Klimatyczna Herbaciarnia w Pile/g, `${NEW} – Piła`],
  [/Herbatka między słowami – klimatyczna herbaciarnia w Pile/g, `${NEW} w Pile`],
  [/Herbatka między słowami — klimatyczna herbaciarnia/g, `${NEW} w Pile`],
  // „herbaciarnia «Herbatka między słowami»” → odmieniona nazwa własna (bez dublowania słowa)
  [/herbaciarni[aęi]? „Herbatka między słowami["”]/g, (m) => {
    const form = m.startsWith('herbaciarnię') ? 'Herbaciarnię' : m.startsWith('herbaciarni „') ? 'Herbaciarni' : 'Herbaciarnia';
    return `${form} Między Słowami`;
  }],
  // Pozostałe wystąpienia nazwy własnej
  [/Herbatka [Mm]iędzy [Ss]łowami/g, NEW],
  // Słowa kluczowe wyszukiwania (zachowujemy starą frazę jako synonim)
  [/data-keywords="herbatka między słowami /g, 'data-keywords="herbaciarnia między słowami herbatka między słowami '],
  [/'herbatka miedzy slowami', /g, "'herbaciarnia miedzy slowami', 'herbatka miedzy slowami', "],
];

const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  .split('\0').filter(Boolean)
  .filter((f) => /\.(html|js|mjs|json)$/i.test(f))
  .filter((f) => !/\.bak|node_modules|^prod_index/i.test(f));

const changed = [];
for (const rel of tracked) {
  const file = path.join(ROOT, rel);
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }
  if (!/herbatka [mM]i[ęe]dzy/i.test(src) && !/\[`Herbatka `/.test(src)) continue;
  let out = src;
  for (const [re, rep] of rules) out = out.replace(re, rep);
  if (out !== src) {
    fs.writeFileSync(file, out, 'utf8');
    changed.push(rel);
  }
}
console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
