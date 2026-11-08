// Kurs Codzienny „Z Biblią za Pan Brat” — czyste funkcje publikacji dnia (@007, 2026-11-02).
// Każda funkcja dostaje tekst i zwraca nowy tekst; zapis na dysk robi publikuj-dzien.mjs.
// Wzór znaczników: stan main z 02.11.2026 (Dzień 33, 8 plików spisu, umiejętność kc-z-biblia-lekcja).

export const TZ = 'Europe/Warsaw';
const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const DNI_TYG = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];

export const pad2 = (n) => String(n).padStart(2, '0');
export const slugDnia = (n) => `dzien-${pad2(n)}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => String(s).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const wielka = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Data RRRR-MM-DD w strefie Europe/Warsaw. */
export function dataPolska(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Dzień 1 kursu = 2026-10-01; Dzień N = 1 października + (N − 1) dni. */
export function dataDnia(n) {
  return new Date(Date.UTC(2026, 9, n)).toISOString().slice(0, 10);
}

export function czesciDaty(iso) {
  const [rok, mies, dzien] = iso.split('-').map(Number);
  const tydzien = DNI_TYG[new Date(Date.UTC(rok, mies - 1, dzien)).getUTCDay()];
  return { rok, dzien, miesiacDop: MIESIACE[mies - 1], tydzien };
}

// ── Dane dnia ze strony lekcji ──────────────────────────────────────────────
/** { tytul, ref, opis, obraz, alt } z <title>, meta description i og:image lekcji. */
export function daneLekcji(html, n) {
  const t = /<title>Dzień (\d+): ([^<|]+?)\s*\(([^)]+)\)\s*\|/.exec(html);
  if (!t || Number(t[1]) !== n) throw new Error(`lekcja: tytuł nie zaczyna się od „Dzień ${n}:”`);
  const meta = (re) => { const m = html.match(re); return m ? unesc(m[1]) : ''; };
  const opisMeta = meta(/<meta name="description" content="([^"]*)"/);
  // „Księga Wyjścia — Miesiąc 2, Dzień 34 (3 Listopada 2026). Teofania … — Wj 3:1–22. Kurs codzienny …”
  const opis = opisMeta.replace(/^.*?Dzień \d+(?: \([^)]*\))?\.\s*/, '').replace(/\s*Kurs codzienny Pisma Świętego\.?\s*$/i, '').trim();
  const obraz = meta(/<meta property="og:image" content="([^"]*)"/).replace(/^https?:\/\/[^/]+/, '');
  const tytul = unesc(t[2].trim());
  const ref = t[3].trim();
  return { tytul, ref, opis, obraz, alt: `Dzień ${n}: ${tytul} — ${ref}` };
}

// ── Karty dni (8 plików spisu) ──────────────────────────────────────────────
const KLASA_DZIS = 'group block p-5 rounded-2xl bg-[#0E121A] border-2 border-brand-gold hover:border-amber-400 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-xl shadow-black/50 flex flex-col relative ring-1 ring-amber-500/30';
const KLASA_DOSTEPNA = 'group block p-5 rounded-2xl bg-[#0E121A] border border-brand-gold/40 hover:border-amber-500 hover:bg-[#161B26] transition-all transform hover:-translate-y-1 shadow-lg shadow-black/40 flex flex-col';
const ZNACZEK_DZIS = '<span class="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 text-[10px] font-extrabold border border-amber-500/50 animate-pulse">DZISIEJSZA LEKCJA</span>';
const ZNACZEK_DOSTEPNA = '<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">DOSTĘPNA TERAZ</span>';
const KARTA_RE = /<!-- KARTA DZIEŃ (\d+) -->\s*<a href="[^"]*" class="group[^"]*">[\s\S]*?<\/a>/g;

export function karty(html) {
  return [...html.matchAll(KARTA_RE)].map((m) => ({ numer: Number(m[1]), start: m.index, koniec: m.index + m[0].length, blok: m[0] }));
}

/** Nowa karta = kopia karty wzorcowej (zachowuje aktualne klasy i układ) z podmienionymi polami dnia. */
export function kartaDnia(wzor, n, iso, d) {
  const { dzien, miesiacDop, rok } = czesciDaty(iso);
  let k = wzor
    .replace(/<!-- KARTA DZIEŃ \d+ -->/, `<!-- KARTA DZIEŃ ${n} -->`)
    .replace(/<a href="[^"]*" class="group[^"]*">/, `<a href="/akademia/kurscodzienny/${slugDnia(n)}" class="${KLASA_DZIS}">`)
    .replace(/DZIEŃ \d+ • [^<]+<\/span>/, `DZIEŃ ${n} • ${dzien} ${miesiacDop.toUpperCase()} ${rok}</span>`)
    .replace(/<span class="px-2 py-0.5 rounded-full [^"]*">(?:DOSTĘPNA TERAZ|ZAPOWIEDŹ NA JUTRO|DZISIEJSZA LEKCJA)<\/span>/, ZNACZEK_DZIS)
    .replace(/<img src="[^"]*" alt="[^"]*"/, `<img src="${esc(d.obraz)}" alt="${esc(d.alt)}"`)
    .replace(/(<h3[^>]*>\s*)[\s\S]*?(\s*<\/h3>)/, `$1${esc(d.tytul)}$2`)
    .replace(/(<p class="text-xs text-zinc-400[^"]*">\s*)[\s\S]*?(\s*<\/p>)/, `$1${esc(d.opisKarty)}$2`)
    .replace(/(fa-book-open[^>]*><\/i>\s*<span>)[^<]*(<\/span>)/, `$1${esc(d.ref)}$2`);
  return k;
}

/** Karta „dzisiaj” → „DOSTĘPNA TERAZ”; dopisuje kartę dnia N za ostatnią kartą. */
export function dodajKarte(html, n, iso, d) {
  const lista = karty(html);
  if (!lista.length) throw new Error('spis: brak kart dni');
  if (lista.some((k) => k.numer === n)) return { html, zmian: 0 };
  const ost = lista[lista.length - 1];
  if (ost.numer !== n - 1) throw new Error(`spis: ostatnia karta to Dzień ${ost.numer}, a publikujemy Dzień ${n} — luka albo zła kolejność`);
  let out = html;
  // 1. Wszystkie karty „DZISIEJSZA LEKCJA” oraz „ZAPOWIEDŹ NA JUTRO” → „DOSTĘPNA TERAZ”.
  for (const k of [...lista].reverse()) {
    if (!k.blok.includes('DZISIEJSZA LEKCJA') && !k.blok.includes('ZAPOWIEDŹ NA JUTRO')) continue;
    let nowy = k.blok.replace(`class="${KLASA_DZIS}"`, `class="${KLASA_DOSTEPNA}"`);
    nowy = nowy.replace(/<span class="px-2 py-0.5 rounded-full [^"]*">(?:DZISIEJSZA LEKCJA|ZAPOWIEDŹ NA JUTRO)<\/span>/g, ZNACZEK_DOSTEPNA);
    out = out.slice(0, k.start) + nowy + out.slice(k.koniec);
  }
  // 2. Nowa karta za ostatnią (wcięcie jak w karcie poprzedniej).
  const po = karty(out);
  const p = po[po.length - 1];
  const wciecie = out.slice(out.lastIndexOf('\n', p.start) + 1, p.start);
  const nowa = kartaDnia(p.blok, n, iso, d);
  out = out.slice(0, p.koniec) + `\n\n${/^\s*$/.test(wciecie) ? wciecie : '          '}` + nowa + out.slice(p.koniec);
  return { html: out, zmian: 1 };
}

/** Przyciski hero: „CZYTAJ DZIEŃ N (DATA) →” i „← DZIEŃ N−1”. */
export function zaktualizujHero(html, n, iso) {
  const { dzien, miesiacDop } = czesciDaty(iso);
  let zmian = 0;
  const out = html
    .replace(/href="\/akademia\/kurscodzienny\/dzien-\d+"(\s+class="cin-btn-primary[^"]*">\s*<span>)CZYTAJ DZIEŃ \d+ \([^)]*\)/g, (_, srodek) => { zmian++; return `href="/akademia/kurscodzienny/${slugDnia(n)}"${srodek}CZYTAJ DZIEŃ ${n} (${dzien} ${miesiacDop.toUpperCase()})`; })
    .replace(/href="\/akademia\/kurscodzienny\/dzien-\d+"(\s+class="cin-btn-secondary[^"]*">\s*<span>)← DZIEŃ \d+/g, (_, srodek) => { zmian++; return `href="/akademia/kurscodzienny/${slugDnia(n - 1)}"${srodek}← DZIEŃ ${n - 1}`; });
  return { html: out, zmian };
}

/** Licznik „Dni 1–N Dostępne (D Miesiąca RRRR)” (opcjonalnie „z X”). */
export function zaktualizujLicznik(html, n, iso) {
  const { dzien, miesiacDop, rok } = czesciDaty(iso);
  let zmian = 0;
  const out = html.replace(/Dni 1–\d+( z \d+)? Dostępne \([^)]*\)/g, (_, z) => { zmian++; return `Dni 1–${n}${z || ''} Dostępne (${dzien} ${wielka(miesiacDop)} ${rok})`; });
  return { html: out, zmian };
}

/** Kontrola po zmianie: karta N raz, dokładnie jedna „DZISIEJSZA LEKCJA”, hero i licznik na dniu N. */
export function sprawdzSpis(html, n) {
  const bledy = [];
  const lista = karty(html);
  if (lista.filter((k) => k.numer === n).length !== 1) bledy.push(`karta Dnia ${n} nie występuje dokładnie raz`);
  if ((html.match(/DZISIEJSZA LEKCJA/g) || []).length !== 1) bledy.push('„DZISIEJSZA LEKCJA” nie występuje dokładnie raz');
  if (!lista.find((k) => k.numer === n)?.blok.includes('DZISIEJSZA LEKCJA')) bledy.push(`karta Dnia ${n} nie jest „DZISIEJSZA LEKCJA”`);
  if (!html.includes(`CZYTAJ DZIEŃ ${n} (`)) bledy.push(`hero nie wskazuje Dnia ${n}`);
  if (!new RegExp(`Dni 1–${n}( z \\d+)? Dostępne`).test(html)) bledy.push(`licznik nie pokazuje Dni 1–${n}`);
  const numery = lista.map((k) => k.numer);
  if (numery.some((x, i) => x !== i + 1)) bledy.push('karty nie idą kolejno od Dnia 1');
  return bledy;
}

// ── Lekcja poprzednia (N−1) ─────────────────────────────────────────────────
/** Odnośnik „← Dzień P” w górnym pasku (pierwszy w pliku); oba spotykane wzory: jednoliniowy i z <span>. */
const linkWstecz = (p) => new RegExp(`<a href="/akademia/kurscodzienny/${slugDnia(p)}" class="([^"]*)">([\\s\\S]{0,200}?)← Dzień ${p}([\\s\\S]{0,200}?)</a>`);

/** Dodaje „Dzień N →” w górnym pasku za „← Dzień N−2” — w tym samym stylu co odnośnik wstecz. */
export function linkNastepny(html, n) {
  if (html.includes(`>Dzień ${n} →</a>`) || new RegExp(`<span>Dzień ${n} →</span>`).test(html)) return { html, zmian: 0 };
  const m = linkWstecz(n - 2).exec(html);
  if (!m) throw new Error(`Dzień ${n - 1}: nie znaleziono „← Dzień ${n - 2}” w pasku nawigacji`);
  const link = `<a href="/akademia/kurscodzienny/${slugDnia(n)}" class="${m[1]}">${m[2]}Dzień ${n} →${m[3]}</a>`;
  const wciecie = html.slice(html.lastIndexOf('\n', m.index) + 1, m.index);
  const poz = m.index + m[0].length;
  return { html: html.slice(0, poz) + `\n${/^\s*$/.test(wciecie) ? wciecie : '        '}${link}` + html.slice(poz), zmian: 1 };
}

/**
 * Pozostałości po kopiowaniu lekcji poprzedniego dnia (krok C5 umiejętności): „Dzień P”, dzien-PP, kc_dayP, „Dzień P” w linkach
 * udostępniania. Dozwolony jest tylko odnośnik „← Dzień P” w pasku nawigacji. Zwraca numery wierszy.
 */
export function pozostalosci(html, n) {
  const p = n - 1;
  const bez = html.replace(new RegExp(linkWstecz(p).source, 'g'), (x) => x.replace(/[^\n]/g, ''));
  const re = new RegExp(`Dzień ${p}(?!\\d)|dzien-${pad2(p)}(?!\\d)|kc_day_?${p}(?!\\d)|Dzie%C5%84%20${p}(?!\\d)`);
  return bez.split('\n').map((l, i) => (re.test(l) ? i + 1 : 0)).filter(Boolean);
}

/** Podmienia sekcję „Jutro” w miejscu (albo wstawia ją przed </main>, gdy jej nie ma). `sekcja` = wynik jutro() z align-kc-lessons-day1. */
export function podmienJutro(html, sekcja) {
  const nowa = sekcja.match(/<section[^>]*id="jutro"[\s\S]*?<\/section>/);
  if (!nowa) throw new Error('generator „Jutro” nie zwrócił sekcji');
  const stara = /<section[^>]*id="jutro"[\s\S]*?<\/section>/;
  if (stara.test(html)) return html.replace(stara, () => nowa[0]);
  if (!/\n\s*<\/main>/.test(html)) throw new Error('brak </main>');
  return html.replace(/\n\s*<\/main>/, (m) => `\n${sekcja}${m}`);
}

/** Liczba pytań w QUIZ_DATA (format {"q": …} albo {q: …}). */
export function pytaniaQuizu(html) {
  const m = html.match(/const QUIZ_DATA = (\[[\s\S]*?\]);\s*\n/);
  if (!m) return 0;
  try { return JSON.parse(m[1]).length; } catch { return (m[1].match(/["']?q["']?\s*:/g) || []).length; }
}

// ── Wyszukiwarka (szukaj/catalog.json, data/cc-search-index.json) ───────────
export function zaktualizujWyszukiwarke(json, { n, iso, d, szukaj = {}, teraz }) {
  const j = JSON.parse(json);
  const items = j.items;
  const url = `https://polskieradio.cc/akademia/kurscodzienny/${slugDnia(n)}`;
  const { dzien, miesiacDop, rok } = czesciDaty(iso);
  // Tytuł jak w lekcji (wersaliki); zamiana na zdanie zepsułaby imiona („Boga”, „Mojżesza”) — ładniejszy podaje meta.szukaj.tytul.
  const tytulZdania = szukaj.tytul || d.tytul;
  // Poprzednie „na dziś” wygasają.
  for (const it of items) {
    if (it.url === url || !/\/akademia\/kurscodzienny\/dzien-\d+$/.test(it.url || '')) continue;
    if (!/na dziś/.test(it.title || '') && !it.featured) continue;
    it.title = it.title.replace(/ na dziś\)/, ')');
    if (it.description) it.description = it.description.replace(/ na dziś,/, ',');
    it.tags = (it.tags || []).filter((t) => !/na dziś|^dzisiaj$|^dziś$/.test(t));
    it.featured = false;
  }
  const wpis = {
    title: `Z Biblią za Pan Brat — Dzień ${n} (Lekcja ${n} na dziś): ${tytulZdania} (${d.ref})`,
    category: 'Biblia i formacja',
    url,
    description: `Kurs Codzienny Pisma Świętego — Dzień ${n} (Lekcja ${n} na dziś, ${dzien} ${miesiacDop} ${rok}). ${szukaj.opis || d.opisKarty}`.trim(),
    tags: [...new Set([
      `lekcja ${n}`, `lekcja ${n} na dziś`, 'lekcja na dziś', `dzień ${n}`, `dzien ${n}`, `rozważanie ${n}`, 'rozważanie na dziś', 'słowo na dziś',
      ...(szukaj.tagi || []),
      d.ref.replace(/:.*$/, '').toLowerCase(), 'z biblią za pan brat', 'kurs codzienny', 'akademia biblijna', `${dzien} ${miesiacDop} ${rok}`, 'dzisiaj', 'dziś',
    ])],
    featured: true,
  };
  const i = items.findIndex((x) => x.url === url);
  if (i === -1) items.unshift(wpis); else items[i] = wpis;
  if ('totalItems' in j) j.totalItems = items.length;
  if ('updatedAt' in j) j.updatedAt = teraz;
  return JSON.stringify(j, null, 2) + (json.endsWith('\n') ? '\n' : '');
}

// ── Mapa strony (sitemaps/akademia.xml) ─────────────────────────────────────
export function dodajDoMapy(xml, n, iso) {
  const loc = `https://polskieradio.cc/akademia/kurscodzienny/${slugDnia(n)}`;
  if (xml.includes(`<loc>${loc}</loc>`)) return { xml, zmian: 0 };
  const wpisy = [...xml.matchAll(/[ \t]*<url>\s*<loc>https:\/\/polskieradio\.cc\/akademia\/kurscodzienny\/dzien-\d+<\/loc>[\s\S]*?<\/url>\n/g)];
  if (!wpisy.length) throw new Error('sitemaps/akademia.xml: brak wpisów lekcji');
  const ost = wpisy[wpisy.length - 1];
  const nowy = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${iso}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  const poz = ost.index + ost[0].length;
  return { xml: xml.slice(0, poz) + nowy + xml.slice(poz), zmian: 1 };
}

// ── Baza rozważań (pozycja 0 = dzisiejsze; kanały TV i czat czytają pozycję 0) ──
export function dopiszRozwazanie(json, wpis, iso) {
  const lista = JSON.parse(json);
  if (!Array.isArray(lista)) throw new Error('rozwazania_baza.json: oczekiwana tablica');
  if (wpis.date !== iso) throw new Error(`rozważanie: date ${wpis.date} ≠ data paczki ${iso}`);
  const i = lista.findIndex((x) => x && ((wpis.id && x.id === wpis.id) || (x.day === wpis.day && x.date === wpis.date)));
  if (i !== -1) {
    if (lista[i].date !== wpis.date) throw new Error(`rozważanie: wpis ${wpis.id} istnieje z inną datą — odmowa nadpisania historii`);
    lista.splice(i, 1);
  }
  lista.unshift(wpis);
  return JSON.stringify(lista, null, 2) + (json.endsWith('\n') ? '\n' : '');
}
