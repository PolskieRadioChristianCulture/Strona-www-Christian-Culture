// Chronione strony produkcji (@007, polecenie L0 17.11.2026: „Nie wolno nikomu cofać wersji”).
//
// Incydent 17.11 16:27: wdrożenie ze wspólnego checkoutu, którego lokalny main nie zawierał
// origin/main (8 commitów), przywróciło starą /ccwomen i ominęło bramkę gałęzi
// (safe_pages_deploy.mjs jej nie miał). Ten moduł działa w KAŻDYM skrypcie budującym wydanie
// oraz w strażniku produkcji (scripts/cc-straznik-wersji.mjs), który sprawdza stronę na żywo.
//
// Zasady:
//  1. Wydanie nie przejdzie, jeśli plik chronionej strony różni się od wersji na origin/main.
//  2. Każda chroniona strona ma znaczniki aktualnej wersji — brak znacznika = cofnięta wersja.
//  3. Zmiana chronionej strony: commit na main (z testami) + aktualizacja znaczników tutaj.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const PROTECTED_PAGES = [
  {
    file: 'ccwomen/index.html',
    url: 'https://polskieradio.cc/ccwomen/',
    approved: 'L0 17.11.2026 (/ccwomen ultra premium z TVW, poprawki hero)',
    markers: ['id="tvwFrame"', 'class="wrap hero-after"'],
  },
  {
    file: 'tvw.html',
    url: 'https://polskieradio.cc/tvw',
    approved: 'L0 17.11.2026 (TVW Telewizja Kobiet)',
    markers: ['const TVW_RAMOWKA', '[?&]tv=1'],
  },
  {
    file: 'tvw-women-live.html',
    url: 'https://polskieradio.cc/tvw-women-live',
    approved: 'L0 17.11.2026 (kanał CC Women w TVW)',
    markers: ['function hideCaptions', 'TVW_PLAYLIST'],
  },
  {
    file: 'master-live.html',
    url: 'https://polskieradio.cc/master-live',
    approved: 'L0 17.11.2026 (telefon pion/poziom, Polecamy, kolory CC, czat prowadzących)',
    markers: ['id="mlPromo"', 'ml-cc-orange-palette'],
  },
  {
    file: 'nadawaj.html',
    url: 'https://polskieradio.cc/nadawaj',
    approved: 'L0 17.11.2026 (nowa /nadawaj: intro CC TV, pierścień kanałów, 25 kanałów)',
    markers: ['id="tvhero"', 'id="ring"'],
  },
  {
    file: 'wspieraj.html',
    url: 'https://polskieradio.cc/wspieraj',
    approved: 'L0 18.11.2026 (nowa /wspieraj: glob 3D, szybki BLIK, konto LUMINA i podziękowania)',
    markers: ['id="ccAuthWidgetSlot"', 'id="gifts"'],
  },
];

const normalize = (text) => String(text).replace(/\r\n/g, '\n');

/** Brakujące znaczniki aktualnej wersji w treści strony (pusta lista = wersja aktualna). */
export function missingMarkers(page, html) {
  return page.markers.filter((marker) => !String(html || '').includes(marker));
}

function gitShow(root, ref, file) {
  try {
    return execFileSync('git', ['show', `${ref}:${file}`], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return null;
  }
}

/**
 * Sprawdza źródła (ROOT) i gotowy katalog wydania. Zwraca listę błędów (pusta = OK).
 * ref — gałąź odniesienia (domyślnie origin/main, pobrana wcześniej przez bramkę gałęzi).
 */
export function checkProtectedPages({ root, releaseDir, ref = 'origin/main', pages = PROTECTED_PAGES } = {}) {
  const errors = [];
  for (const page of pages) {
    const sourcePath = path.join(root, page.file);
    if (!fs.existsSync(sourcePath)) {
      errors.push(`${page.file}: brak pliku w drzewie wydania`);
      continue;
    }
    const source = fs.readFileSync(sourcePath, 'utf8');
    const onMain = gitShow(root, ref, page.file);
    if (onMain !== null && normalize(onMain) !== normalize(source)) {
      errors.push(`${page.file}: treść różni się od ${ref} — wydanie cofnęłoby albo pominęło zatwierdzoną wersję (${page.approved})`);
    }
    const missingSrc = missingMarkers(page, source);
    if (missingSrc.length) errors.push(`${page.file}: brak znaczników aktualnej wersji: ${missingSrc.join(', ')}`);
    if (releaseDir) {
      const releasePath = path.join(releaseDir, page.file);
      if (!fs.existsSync(releasePath)) errors.push(`${page.file}: brak w katalogu wydania`);
      else {
        const missingRel = missingMarkers(page, fs.readFileSync(releasePath, 'utf8'));
        if (missingRel.length) errors.push(`${page.file}: w wydaniu brak znaczników: ${missingRel.join(', ')}`);
      }
    }
  }
  return errors;
}

/** Rzuca błąd z czytelnym komunikatem, gdy wydanie narusza chronione strony. */
export function enforceProtectedPages(options) {
  if (String(process.env.CC_PROTECTED_PAGES_GUARD || '').toLowerCase() === 'off') {
    console.log('⚠️ Ochrona chronionych stron WYŁĄCZONA (CC_PROTECTED_PAGES_GUARD=off) — tylko za zgodą L0.');
    return [];
  }
  const errors = checkProtectedPages(options);
  if (errors.length) {
    throw new Error(`Wydanie przerwane — CHRONIONE STRONY (decyzja L0: nie wolno cofać wersji):\n- ${errors.join('\n- ')}\nNajpierw: git fetch origin && git pull --rebase origin main. Pytania: @007 w Skrzynce.`);
  }
  return errors;
}
