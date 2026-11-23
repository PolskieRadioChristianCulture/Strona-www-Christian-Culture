// CCN Ogłoszenia — bundle cc20261123 (@007, 2026-11-23, decyzja L0 „🔧 NAPRAW wszystko”).
// Źródła React tego bundla nie ma w repo (wcześniejsze wersje też łatano skryptami, np. build-bundle-h.cjs).
// Najbezpieczniej: rozpakować poprzedni bundle esbuildem do czytelnej postaci, nałożyć łatki
// z kontrolą liczby trafień (każda łatka musi trafić dokładnie tyle razy, ile oczekujemy),
// i ponownie zminifikować. Poprzedni bundle zostaje nietknięty.
// Uruchomienie: node scripts/build-ogloszenia-bundle-20261123.cjs
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const SRC = path.resolve(__dirname, '../assets/ogloszenia-index-cc20261013h.js');
const DST = path.resolve(__dirname, '../assets/ogloszenia-index-cc20261123.js');

let s = esbuild.transformSync(fs.readFileSync(SRC, 'utf8'), { loader: 'js', logLevel: 'error' }).code;

function patch(name, from, to, expected = 1) {
  const n = s.split(from).length - 1;
  if (n !== expected) throw new Error(`[${name}] oczekiwano ${expected} trafień, jest ${n}`);
  s = s.split(from).join(to);
}

// Uwaga: esbuild zapisuje polskie znaki jako \uXXXX — w łańcuchach poniżej backslash jest podwojony.

// ── 1. Etykiety z banera kampanii: Kupuję · Sprzedaję · Wymieniam · Szukam ──
patch('label sprzedam', 'label: `\\u{1F3F7}\\uFE0F Sprzedam`', 'label: `\\u{1F3F7}\\uFE0F Sprzedaj\\u0119`', 3);
patch('label kupie', 'label: `\\u{1F50D} Kupi\\u0119`', 'label: `\\u{1F6D2} Kupuj\\u0119`', 3);
patch('label zamienie', 'label: `\\u{1F504} Zamieni\\u0119`', 'label: `\\u{1F504} Wymieniam`', 3);
patch('case szukam', '      case `kupie`:\n',
  '      case `szukam`:\n        return { label: `\\u{1F50E} Szukam`, bg: `bg-sky-50 text-sky-800 border-sky-200` };\n      case `kupie`:\n', 2);
patch('form option sprzedam', '{ value: `sprzedam`, children: `\\u{1F3F7}\\uFE0F Sprzedam` }', '{ value: `sprzedam`, children: `\\u{1F3F7}\\uFE0F Sprzedaj\\u0119` }');
patch('form option kupie', '{ value: `kupie`, children: `\\u{1F50D} Kupi\\u0119` }', '{ value: `kupie`, children: `\\u{1F6D2} Kupuj\\u0119` }');
patch('form option zamienie+szukam', '{ value: `zamienie`, children: `\\u{1F504} Zamieni\\u0119` })',
  '{ value: `zamienie`, children: `\\u{1F504} Wymieniam` }), (0, x.jsx)(`option`, { value: `szukam`, children: `\\u{1F50E} Szukam` })');

// ── 2. Nowe kategorie: Wydarzenia, Współpraca w misji ──
const NEW_CAT_OPTIONS = ', (0, x.jsx)(`option`, { value: `wydarzenia`, children: `\\u{1F4C5} Wydarzenia` }), (0, x.jsx)(`option`, { value: `wspolpraca`, children: `\\u{1F64C} Wsp\\xF3\\u0142praca w misji` })';
patch('form categories', '{ value: `duchowe`, children: `Ksi\\u0105\\u017Cki, Biblie, instrumenty, modlitwa` })',
  '{ value: `duchowe`, children: `Ksi\\u0105\\u017Cki, Biblie, instrumenty, modlitwa` })' + NEW_CAT_OPTIONS);
patch('filter categories', '{ value: `duchowe`, children: `\\u{1F4D6} Ksi\\u0105\\u017Cki, Pismo \\u015Awi\\u0119te` })',
  '{ value: `duchowe`, children: `\\u{1F4D6} Ksi\\u0105\\u017Cki, Pismo \\u015Awi\\u0119te` })' + NEW_CAT_OPTIONS);
patch('card category labels', '      case `nocleg`:\n        return `\\u{1F3E1} Noclegi & Agroturystyka`;\n      default:\n        return `Inne`;',
  '      case `nocleg`:\n        return `\\u{1F3E1} Noclegi & Agroturystyka`;\n      case `wydarzenia`:\n        return `\\u{1F4C5} Wydarzenia`;\n      case `wspolpraca`:\n        return `\\u{1F64C} Wsp\\xF3\\u0142praca w misji`;\n      default:\n        return `Inne`;');

// ── 3. Szybkie filtry (chipy) w kolejności banera; kategorie mają prefiks cat: ──
const cnt = cond => `e2.filter((z) => z && ${cond}).length`;
patch('chips banner', '[{ id: `all`, label: `Wszystkie`, count: T2.all }, ',
  '[{ id: `all`, label: `Wszystkie`, count: T2.all }, ' +
  `{ id: \`kupie\`, label: \`\\u{1F6D2} Kupuj\\u0119\`, count: ${cnt('z.type === `kupie`')} }, ` +
  `{ id: \`sprzedam\`, label: \`\\u{1F3F7}\\uFE0F Sprzedaj\\u0119\`, count: ${cnt('z.type === `sprzedam`')} }, ` +
  `{ id: \`zamienie\`, label: \`\\u{1F504} Wymieniam\`, count: ${cnt('z.type === `zamienie`')} }, ` +
  `{ id: \`szukam\`, label: \`\\u{1F50E} Szukam\`, count: ${cnt('z.type === `szukam`')} }, ` +
  `{ id: \`cat:uslugi\`, label: \`\\u{1F527} Us\\u0142ugi\`, count: ${cnt('z.category === `uslugi`')} }, ` +
  `{ id: \`cat:wydarzenia\`, label: \`\\u{1F4C5} Wydarzenia\`, count: ${cnt('z.category === `wydarzenia`')} }, ` +
  `{ id: \`cat:wspolpraca\`, label: \`\\u{1F64C} Wsp\\xF3\\u0142praca w misji\`, count: ${cnt('z.category === `wspolpraca`')} }, `);
patch('chips old tail', ', { id: `sprzedam`, label: `\\u{1F3F7}\\uFE0F Sprzedaj\\u0119`, count: T2.sprzedam }, { id: `kupie`, label: `\\u{1F6D2} Kupuj\\u0119`, count: T2.kupie }, { id: `zamienie`, label: `\\u{1F504} Wymieniam`, count: T2.zamienie }]', ']');
patch('chip click', 'onClick: () => l2(e3.id), className: `px-3.5 py-1.5 rounded-full',
  'onClick: () => e3.id.startsWith(`cat:`) ? (d2(e3.id.slice(4)), l2(`all`)) : (l2(e3.id), e3.id === `all` && d2(`all`)), className: `px-3.5 py-1.5 rounded-full');
patch('chip active', '${c2 === e3.id ?', '${(e3.id.startsWith(`cat:`) ? u2 === e3.id.slice(4) : c2 === e3.id) ?', 2);

// ── 4. Zdjęcie nieobowiązkowe ──
patch('form media required', '    let hasMedia = !!(C2.trim() || T2.trim() || w2.some((x2) => x2 && x2.trim()));\n    if (!hasMedia) {\n      alert(`Wymagane jest dodanie co najmniej jednego zdj\\u0119cia (link WWW / Dysk Google) lub filmu wideo (np. z YouTube), aby og\\u0142oszenie by\\u0142o atrakcyjne i kompletne.`);\n      return;\n    }\n', '');
patch('media badge', 'className: `text-[11px] text-red-600 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded`, children: `Wymagane *`',
  'className: `text-[11px] text-zinc-600 font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded`, children: `Opcjonalnie`');

// ── 5. Moderacja: komunikaty, Patron tylko dla admina, oznaczenia, przyciski Zatwierdź / Odrzuć ──
patch('form notice', 'Og\\u0142oszenie zobacz\\u0105 wszyscy odwiedzaj\\u0105cy.',
  'Og\\u0142oszenie pojawi si\\u0119 na tablicy po zatwierdzeniu przez administratora CC.');
patch('patron checkbox admin only', '(0, x.jsx)(`div`, { className: `p-3.5 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300/80 rounded-xl shadow-2xs mb-2`',
  'window.CCOgloszeniaStore && typeof window.CCOgloszeniaStore.isAdmin === `function` && window.CCOgloszeniaStore.isAdmin() && (0, x.jsx)(`div`, { className: `p-3.5 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border-2 border-amber-300/80 rounded-xl shadow-2xs mb-2`');
patch('submit label', 'children: `Opublikuj na tablicy`', 'children: `Wy\\u015Blij og\\u0142oszenie`');
patch('toast publish', 'S3.publish(adData).then(() => C2(`Og\\u0142oszenie opublikowane \\u2014 widz\\u0105 je wszyscy odwiedzaj\\u0105cy.`, `success`))',
  'S3.publish(adData).then((ad) => C2(ad && ad.pending ? `Dzi\\u0119kujemy! Og\\u0142oszenie czeka na zatwierdzenie przez administratora. Na tablicy widzisz je z dopiskiem \\u201Eczeka na zatwierdzenie\\u201D.` : `Og\\u0142oszenie opublikowane \\u2014 widz\\u0105 je wszyscy odwiedzaj\\u0105cy.`, `success`))');
patch('toast update', 'C2(`Og\\u0142oszenie zosta\\u0142o pomy\\u015Blnie zaktualizowane! \\u2705`, `success`);',
  'C2(updated && updated.pending ? `Zmiany zapisane \\u2014 og\\u0142oszenie czeka na ponowne zatwierdzenie.` : `Og\\u0142oszenie zosta\\u0142o pomy\\u015Blnie zaktualizowane! \\u2705`, `success`);');
const STATUS_BADGE = '(e2.pending || e2.rejected) && (0, x.jsx)(`div`, { className: `px-3 py-1 rounded-full text-[11px] font-bold mb-3 w-fit border ${e2.pending ? `bg-amber-50 text-amber-900 border-amber-300` : `bg-red-50 text-red-800 border-red-200`}`, children: e2.pending ? `\\u23F3 Czeka na zatwierdzenie` : `Odrzucone przez administratora` }), ';
patch('card status badge', 'children: [(0, x.jsxs)(`div`, { children: [isF && ', 'children: [(0, x.jsxs)(`div`, { children: [' + STATUS_BADGE + 'isF && ');
patch('modal status notice', '(e2.featured || e2.isPatron) && (0, x.jsxs)(`div`, { className: `p-4 bg-gradient-to-r from-amber-100/90',
  '(e2.pending || e2.rejected) && (0, x.jsx)(`div`, { className: `p-3.5 mb-5 rounded-xl border text-sm font-semibold ${e2.pending ? `bg-amber-50 text-amber-950 border-amber-300` : `bg-red-50 text-red-900 border-red-200`}`, children: e2.pending ? `\\u23F3 Czeka na zatwierdzenie \\u2014 og\\u0142oszenie widzisz tylko Ty (i administrator). Po zatwierdzeniu zobacz\\u0105 je wszyscy.` : `To og\\u0142oszenie zosta\\u0142o odrzucone przez administratora i nie jest publiczne.` }), ' +
  '(e2.featured || e2.isPatron) && (0, x.jsxs)(`div`, { className: `p-4 bg-gradient-to-r from-amber-100/90');
const MOD_BTN = (fn, cls, label) => `e2.canModerate && e2.pending && (0, x.jsx)(\`button\`, { type: \`button\`, onClick: () => { window.CCOgloszeniaStore && window.CCOgloszeniaStore.${fn}(e2.id).then(() => t2()).catch(() => alert(\`Nie uda\\u0142o si\\u0119 zapisa\\u0107. Spr\\xF3buj ponownie.\`)); }, className: \`inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-lg text-xs font-bold transition cursor-pointer ${cls}\`, children: \`${label}\` }), `;
patch('modal moderate buttons', '(e2.canEdit || e2.canDelete) && (0, x.jsxs)(`button`, { type: `button`, onClick: () => {\n    t2();\n    _edit && _edit(e2);',
  MOD_BTN('approve', 'bg-green-700 hover:bg-green-800 text-white', '\\u2705 Zatwierd\\u017A') + MOD_BTN('reject', 'bg-white hover:bg-red-50 text-red-700 border border-red-200', '\\u274C Odrzu\\u0107') +
  '(e2.canEdit || e2.canDelete) && (0, x.jsxs)(`button`, { type: `button`, onClick: () => {\n    t2();\n    _edit && _edit(e2);');

// ── 6. Telefon: uproszczony pasek górny (jeden „Dodaj ogłoszenie” w sekcji głównej i w menu) ──
patch('header add btn', 'className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#bb142e] hover:bg-[#a01026] text-white text-xs font-bold uppercase tracking-wider rounded-lg',
  'className: `hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#bb142e] hover:bg-[#a01026] text-white text-xs font-bold uppercase tracking-wider rounded-lg');
patch('header radio btn', 'className: `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${n2 ?',
  'className: `hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${n2 ?');
patch('header lang btn', 'rounded-lg text-xs font-semibold flex items-center gap-1 transition`', 'rounded-lg text-xs font-semibold hidden sm:flex items-center gap-1 transition`');
patch('header x btn', 'text-zinc-700 transition cursor-pointer flex items-center justify-center min-w-[44px] min-h-[44px] border border-zinc-200`',
  'text-zinc-700 transition cursor-pointer hidden sm:flex items-center justify-center min-w-[44px] min-h-[44px] border border-zinc-200`');
patch('header lumina btn', 'to-[#800d1e] text-white flex items-center justify-center font-black text-xs hover:scale-105',
  'to-[#800d1e] text-white hidden sm:flex items-center justify-center font-black text-xs hover:scale-105');

const out = esbuild.transformSync(s, { loader: 'js', minify: true, logLevel: 'error' }).code;
fs.writeFileSync(DST, out);
console.log('OK', path.relative(process.cwd(), DST), out.length, 'B');
