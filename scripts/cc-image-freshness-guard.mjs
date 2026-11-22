// Strażnik świeżości i wagi obrazów (@007, polecenie L0 22.11.2026: „zablokuj regres do starych wersji”).
//
// Incydenty (powtarzający się problem):
//  - 21.08: wgrano „master graphics” 2–5 MB (commit 43c37662) — LUMINA na telefonie ważyła ~19 MB.
//  - 11.10: obrazy odchudzone w repo (138b52e9), ale Cloudflare trzymał stare kopie z nagłówkiem
//    `immutable` na rok — widzowie dalej dostawali 5 MB zamiast 0,9 MB.
//  - 25.10: _headers poprawione (1 dzień), ale stare kopie zostały w CDN do ręcznego czyszczenia 22.11
//    (47 adresów, ~68 MB nadmiaru).
//
// Zasady:
//  1. Żadna reguła _headers pasująca do obrazu bez wersji w adresie nie może mieć `immutable`
//     ani `max-age` dłuższego niż 1 dzień (Cloudflare Pages łączy WSZYSTKIE pasujące reguły).
//  2. Każde rozszerzenie obrazu ma jawną regułę z krótkim czasem (inaczej decyduje domyślna polityka strefy).
//  3. Obrazy używane przez LUMINA / LUMI MESS nie mogą przekraczać 1 MB. Istniejące wyjątki są
//     zamrożone na obecnym rozmiarze — mogą tylko maleć.
import fs from 'node:fs';
import path from 'node:path';

export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
export const MAX_IMAGE_TTL_SECONDS = 86400;
export const LUMINA_IMAGE_BUDGET_BYTES = 1024 * 1024;

// Zamrożone wyjątki (stan 22.11.2026). Rozmiar nie może wzrosnąć; po odchudzeniu usuń wpis.
export const LUMINA_IMAGE_BUDGET_EXCEPTIONS = {
  'tlo_profilowe_cezary.gif': 16479874,
  'images/academy/diploma_background_master.png': 6034250,
  'assets/ccw-icon.png': 2100239,
  'images/chat/cc-chat-button.png': 1941298,
};

const IMAGE_RE = new RegExp(`\\.(${IMAGE_EXTENSIONS.join('|')})$`, 'i');

export function isImagePath(file) {
  return IMAGE_RE.test(file);
}

// Parser formatu Cloudflare Pages `_headers`: linia ścieżki od kolumny 0, nagłówki wcięte.
export function parseHeadersFile(text) {
  const rules = [];
  let current = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: [] };
      rules.push(current);
      continue;
    }
    if (!current) continue;
    const idx = raw.indexOf(':');
    if (idx === -1) continue;
    current.headers.push({ name: raw.slice(0, idx).trim().toLowerCase(), value: raw.slice(idx + 1).trim() });
  }
  return rules;
}

export function patternToRegExp(pattern) {
  if (/^https?:\/\//i.test(pattern)) return null; // reguły dla innych hostów pomijamy
  let re = '';
  for (let i = 0; i < pattern.length; i += 1) {
    const ch = pattern[i];
    if (ch === '*') re += '.*';
    else if (ch === ':' && /[A-Za-z]/.test(pattern[i + 1] || '')) {
      while (/[A-Za-z0-9_]/.test(pattern[i + 1] || '')) i += 1;
      re += '[^/]+';
    } else re += ch.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function maxAgeOf(value) {
  const m = /(?:^|,)\s*(?:s-)?max-age\s*=\s*(\d+)/i.exec(value);
  return m ? Number(m[1]) : null;
}

// Zwraca listę błędów dla podanych ścieżek obrazów (np. wszystkich publicznych obrazów z repo).
export function checkImageCachePolicy(headersText, imageFiles) {
  const rules = parseHeadersFile(headersText)
    .map((rule) => ({ ...rule, re: patternToRegExp(rule.pattern) }))
    .filter((rule) => rule.re);
  const errors = [];

  for (const ext of IMAGE_EXTENSIONS) {
    const sample = `/__probe__/sample.${ext}`;
    const own = rules.find((r) => r.pattern === `/*.${ext}` && r.headers.some((h) => h.name === 'cache-control'));
    if (!own) errors.push(`_headers: brak jawnej reguły „/*.${ext}” z Cache-Control (max ${MAX_IMAGE_TTL_SECONDS}s, bez immutable)`);
    if (!rules.some((r) => r.re.test(sample))) errors.push(`_headers: żadna reguła nie obejmuje obrazów .${ext}`);
  }

  const offenders = new Map();
  for (const file of imageFiles) {
    const urlPath = `/${file.replace(/\\/g, '/').replace(/^\/+/, '')}`;
    for (const rule of rules) {
      if (!rule.re.test(urlPath)) continue;
      for (const h of rule.headers) {
        if (h.name !== 'cache-control') continue;
        const maxAge = maxAgeOf(h.value);
        const bad = /immutable/i.test(h.value) || (maxAge !== null && maxAge > MAX_IMAGE_TTL_SECONDS);
        if (!bad) continue;
        const key = `${rule.pattern} → ${h.value}`;
        if (!offenders.has(key)) offenders.set(key, []);
        offenders.get(key).push(urlPath);
      }
    }
  }
  for (const [key, files] of offenders) {
    errors.push(`_headers: reguła „${key}” zamraża obrazy w CDN (np. ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` i ${files.length - 3} innych` : ''})`);
  }
  return errors;
}

// Pliki źródłowe LUMINA / LUMI MESS, z których zbieramy odwołania do obrazów.
export function luminaSourceFiles(trackedFiles) {
  return trackedFiles.filter((f) => f === 'lumina.html'
    || /^lumina-[^/]*\.js$/.test(f)
    || /^js\/(lumina|lumi|cc)-[^/]*\.js$/.test(f)
    || /^components\/[^/]*\.js$/.test(f));
}

export function referencedImages(root, sourceFiles, trackedSet) {
  const re = /["'(/]([A-Za-z0-9_\-/.]+\.(?:png|jpe?g|webp|gif|avif))/g;
  const refs = new Set();
  for (const file of sourceFiles) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    for (const m of text.matchAll(re)) {
      const rel = m[1].replace(/^\/+/, '');
      if (trackedSet.has(rel)) refs.add(rel);
    }
  }
  return [...refs].sort();
}

export function checkLuminaImageBudget(root, images, { budget = LUMINA_IMAGE_BUDGET_BYTES, exceptions = LUMINA_IMAGE_BUDGET_EXCEPTIONS } = {}) {
  const errors = [];
  for (const rel of images) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    const size = fs.statSync(full).size;
    const frozen = exceptions[rel];
    if (frozen !== undefined) {
      if (size > frozen) errors.push(`${rel}: ${Math.round(size / 1024)} KB — wyjątek zamrożony na ${Math.round(frozen / 1024)} KB, plik nie może rosnąć`);
      continue;
    }
    if (size > budget) errors.push(`${rel}: ${Math.round(size / 1024)} KB > ${Math.round(budget / 1024)} KB (LUMINA/LUMI MESS na telefonie). Zmniejsz do max 2000 px i skompresuj.`);
  }
  return errors;
}

// Bramka wydania: rzuca wyjątek, gdy reguły cache lub wagi obrazów grożą powrotem starych/ciężkich wersji.
export function enforceImageFreshness({ root, trackedFiles }) {
  const trackedSet = new Set(trackedFiles);
  const headersPath = path.join(root, '_headers');
  const images = trackedFiles.filter(isImagePath);
  const errors = [
    ...checkImageCachePolicy(fs.readFileSync(headersPath, 'utf8'), images),
    ...checkLuminaImageBudget(root, referencedImages(root, luminaSourceFiles(trackedFiles), trackedSet)),
  ];
  if (errors.length) {
    throw new Error(`Wydanie przerwane — STRAŻNIK ŚWIEŻOŚCI OBRAZÓW:\n${errors.join('\n')}`);
  }
}
