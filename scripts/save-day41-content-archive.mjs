import fs from 'node:fs';
import path from 'node:path';

const r = JSON.parse(fs.readFileSync('kolejka-publikacji/kurs-codzienny/2026-11-10/rozwazanie.json', 'utf8'));

const pakiet = `# Z BIBLIĄ ZA PAN BRAT — KOMPLET 5 WERSJI
## Dzień 41 (10 listopada 2026): Plagi szarańczy i ciemności egipskiej (Wj 10:1–29)

====================================================================
WERSJA 1: ROZWAŻANIE PORANNE (TTS / Aplikacja „Dobrze, że jesteś”)
====================================================================

${r.fullText}

====================================================================
WERSJA 2: WERSJA WWW / PORTAL (LUMINA / Tablica / cclite.pl z linkami i cyframi)
====================================================================

${r.contentWeb}

====================================================================
WERSJA 3: WERSJA WIECZORNA (SMS)
====================================================================

Dzień 41 (Wj 10:23, 26): „Lecz wszyscy synowie Izraela mieli światło w swoich mieszkaniach — Ani jedno kopyto nie zostanie!”. Wolność w Chrystusie nie zna kompromisów. Trwaj w Bożym świetle! polskieradio.cc

====================================================================
WERSJA 4: SCENARIUSZ WIDEO (Christian Culture TV / Studio Dobrego Słowa)
====================================================================

${r.tvScript}

====================================================================
WERSJA 5: ARTYKUŁ TEOLOGICZNY (CCN NEWS)
====================================================================

${r.ccnArticle}
`;

fs.writeFileSync('scripts/content/pakiet-day41-5wersji.md', pakiet, 'utf8');
console.log('✅ Zapisano scripts/content/pakiet-day41-5wersji.md');
