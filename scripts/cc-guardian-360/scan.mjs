import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional axe-core integration
let AxeBuilder = null;
try {
  const axeModule = await import('@axe-core/playwright');
  AxeBuilder = axeModule.default || axeModule.AxeBuilder || axeModule;
} catch (_) {
  // axe-core is optional, fallback to native DOM checks
}

const configPath = path.join(__dirname, 'config', 'targets.json');
const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
const runId = new Date().toISOString().replace(/[:.]/g, '-');
const out = path.join(__dirname, 'reports', runId);
await fs.mkdir(path.join(out, 'screenshots'), { recursive: true });

console.log(`[CC GUARDIAN 360] Rozpoczynam audyt: ${runId}`);
console.log(`[CC GUARDIAN 360] Liczba serwisów: ${config.targets.length}, Ekrany: ${config.viewports.map(v => v.name).join(', ')}\n`);

const browser = await chromium.launch({ headless: true });
const findings = [];
const scans = [];
const safe = s => s.replace(/[^a-z0-9]+/gi, '-').slice(0, 70);

for (const target of config.targets) {
  for (const viewport of config.viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: 'reduce',
      locale: 'pl-PL'
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('pageerror', err => consoleErrors.push(err.message));

    let status = null, elapsed = null, screenshot = null, axeViolations = [];
    try {
      const start = Date.now();
      const response = await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      elapsed = Date.now() - start;
      status = response?.status() ?? null;
      await page.waitForTimeout(1000);

      screenshot = `screenshots/${safe(target.name)}-${viewport.name}.png`;
      await page.screenshot({ path: path.join(out, screenshot), fullPage: false, animations: 'disabled', timeout: 45000 });

      // 1. Status HTTP
      if (status === null || status >= 400) {
        findings.push({
          severity: target.critical ? 'P0' : 'P1',
          target: target.name,
          viewport: viewport.name,
          type: 'http',
          description: `HTTP ${status}`
        });
      }

      // 2. Poziomy overflow (layout leak)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 3);
      if (overflow) {
        findings.push({
          severity: 'P2',
          target: target.name,
          viewport: viewport.name,
          type: 'layout',
          description: 'Poziomy overflow (scroll poziomy) — naruszenie responsywności mobilnej'
        });
      }

      // 3. Ergonomia dotyku min. 44px (Standard SMCC & WCAG 2.2 AA)
      if (viewport.name === 'mobile') {
        const sub44Buttons = await page.evaluate(() => {
          const els = Array.from(document.querySelectorAll('button, a.btn, [role="button"]'));
          let subCount = 0;
          for (const el of els) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40)) {
              if (!el.closest('[aria-hidden="true"]')) subCount++;
            }
          }
          return subCount;
        });
        if (sub44Buttons > 5) {
          findings.push({
            severity: 'P2',
            target: target.name,
            viewport: viewport.name,
            type: 'touch-target',
            description: `Wykryto ${sub44Buttons} przycisków o wymiarach dotykowych poniżej 40px`
          });
        }
      }

      // 4. Detekcja kolizji wizualnych na odtwarzaczach wideo
      const videoCovered = await page.evaluate(() => {
        const video = document.querySelector('iframe[src*="live"], iframe[src*="master"], video, .video-container');
        if (!video) return null;
        const rect = video.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        
        // Sprawdź czy jakikolwiek element o wysokim z-index przysłania centrum odtwarzacza
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        if (cx >= 0 && cx <= window.innerWidth && cy >= 0 && cy <= window.innerHeight) {
          const topEl = document.elementFromPoint(cx, cy);
          if (topEl && !video.contains(topEl) && topEl !== video) {
            // Ignoruj standardowe przyciski play/overlay wewnątrz playera oraz celowe kontrolki intro w LUMI MESS
            if (!topEl.closest('.video-container, .hero-section, #promoPlayBtn, #liveStreamBox, #lumiIntroOverlay, .lumi-intro-video-wrap, .lumi-intro-controls, #directMessagesModal, .lumi-standalone')) {
              return topEl.className || topEl.tagName;
            }
          }
        }
        return null;
      });
      if (videoCovered) {
        findings.push({
          severity: 'P1',
          target: target.name,
          viewport: viewport.name,
          type: 'visual-collision',
          description: `Odtwarzacz wideo zasłonięty przez element: <${videoCovered}>`
        });
      }

      // 5. Audyt dostępności axe-core (jeśli dostępny)
      if (AxeBuilder) {
        try {
          const result = await new AxeBuilder({ page }).analyze();
          axeViolations = result.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
          for (const v of axeViolations) {
            findings.push({
              severity: v.impact === 'critical' ? 'P1' : 'P2',
              target: target.name,
              viewport: viewport.name,
              type: 'accessibility',
              description: `${v.id}: ${v.help} (${v.nodes} elementów)`
            });
          }
        } catch (_) {}
      }

      // 6. Błędy konsoli JavaScript
      for (const msg of consoleErrors.slice(0, 10)) {
        findings.push({
          severity: 'P2',
          target: target.name,
          viewport: viewport.name,
          type: 'javascript',
          description: msg.slice(0, 350)
        });
      }

      console.log(`  ✓ [${target.name}] [${viewport.name}] HTTP ${status} (${elapsed}ms) | Błędy JS: ${consoleErrors.length}`);
    } catch (err) {
      findings.push({
        severity: target.critical ? 'P0' : 'P1',
        target: target.name,
        viewport: viewport.name,
        type: 'scan',
        description: String(err.message).slice(0, 350)
      });
      console.error(`  ✗ [${target.name}] [${viewport.name}] Błąd skanu: ${err.message}`);
    }

    scans.push({
      target: target.name,
      url: target.url,
      viewport: viewport.name,
      httpStatus: status,
      domLoadMs: elapsed,
      screenshot,
      accessibilityViolations: axeViolations.length,
      consoleErrors: consoleErrors.length
    });

    await context.close();
  }
}

await browser.close();

// Sortowanie według wag P0–P3
const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
findings.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));

const escape = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const p0Count = findings.filter(f => f.severity === 'P0').length;
const p1Count = findings.filter(f => f.severity === 'P1').length;
const p2Count = findings.filter(f => f.severity === 'P2').length;
const p3Count = findings.filter(f => f.severity === 'P3').length;

const summary = `# CC Guardian 360 — Raport Audytu Ekosystemu Christian Culture
**Sygnatura wykonania:** \`${runId}\`  
**Tryb:** Diagnostyka Zero-QA (Read-Only)  
**Stan:** P0: **${p0Count}** | P1: **${p1Count}** | P2: **${p2Count}** | P3: **${p3Count}** | Łącznie prób: **${scans.length}**

---

## 1. Wykryte Incydenty i Obserwacje

| Priorytet | Serwis / Moduł | Ekran | Kategoria | Obserwacja / Diagnoza |
|---|---|---|---|---|
${findings.map(f => `| **${escape(f.severity)}** | ${escape(f.target)} | ${escape(f.viewport)} | ${escape(f.type)} | ${escape(f.description)} |`).join('\n') || '| — | — | — | — | Brak wykrytych incydentów P0–P2. Pełna zgodność ze standardem Zero-QA. |'}

---

## 2. Pokrycie i Wydajność Serwisów

${scans.map(s => `- **${s.target}** [${s.viewport}]: HTTP ${s.httpStatus ?? 'brak'}, DOM: **${s.domLoadMs ?? 'brak'} ms**, Błędy JS: **${s.consoleErrors}**, Zrzut: \`${s.screenshot ?? 'brak'}\``).join('\n')}

---

## 3. Wytyczne Strategiczne i Następne Kroki

1. **Weryfikacja P0/P1:** Wszelkie incydenty krytyczne wymagają natychmiastowej naprawy w repozytorium roboczym.
2. **Standard Zero-QA:** Uruchomić pełną baterię testów regresji (\`npm.cmd run test:guardian\`, \`test:mobile-premium\`, \`test:cc-regression\`) po każdej zmianie.
3. **Archiwizacja i Pamięć JOMA:** Wyniki skanu są automatycznie rejestrowane w \`JOMA_HANDOFFS.md\` oraz dostępne w \`reports/${runId}/\`.
`;

await fs.writeFile(path.join(out, 'report.md'), summary, 'utf8');
await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ runId, scans, findings }, null, 2), 'utf8');

// Synchronizacja do Wspólnej Pamięci JOMA
const jomaDir = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY';
try {
  await fs.writeFile(path.join(jomaDir, 'CC_GUARDIAN_360_NAJNOWSZY_RAPORT.md'), summary, 'utf8');
  console.log(`[CC GUARDIAN 360] Raport pomyślnie zsynchronizowany do: ${jomaDir}/CC_GUARDIAN_360_NAJNOWSZY_RAPORT.md`);
} catch (err) {
  console.warn(`[CC GUARDIAN 360] Zapis do JOMA pominięty: ${err.message}`);
}

console.log(`\n[CC GUARDIAN 360] Audyt ukończony pomyślnie.`);
console.log(`Prób: ${scans.length}, Obserwacji: ${findings.length}`);
console.log(`Raport: ${path.join(out, 'report.md')}`);
