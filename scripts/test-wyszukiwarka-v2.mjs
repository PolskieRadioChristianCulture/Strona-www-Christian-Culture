#!/usr/bin/env node
/**
 * Test regresji Playwright dla /test/wyszukiwarka/ (100% oryginalny wygląd + funkcje v2):
 * 1. Oryginalny wygląd (#ccOmniOverlay, #ccOmniInput, #ccOmniApps) — ZERO stałych bloków multimedialnych na ekranie startowym
 * 2. Dymek raz dziennie „Poznaj aplikacje Christian Culture” przy #ccOmniApps + instalatory w #ccOmniAppsMenu
 * 3. Podpowiedzi multimedialne TYLKO podczas wpisywania („apo”, „biblia audio”): miniatury, ▶ Słuchaj, ▶ Oglądaj, autoreklama „Polecane”, ↑↓, Esc
 * 4. Brak chipów hashtagowych, 0 błędów JS/HTTP 404, 0px overflow (1440px i 375px)
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg'
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const cleanPath = decodeURIComponent((req.url || '/').split('?')[0]);
      let filePath = path.join(ROOT, cleanPath === '/' ? 'index.html' : cleanPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath)) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const targetPath = process.argv.includes('--prod') ? '/wyszukiwarka/' : '/test/wyszukiwarka/';
      resolve({ server, url: `http://127.0.0.1:${server.address().port}${targetPath}` });
    });
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`  ✅ ${msg}`);
}

const { server, url } = await startServer();
const browser = await chromium.launch({ headless: true });

try {
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('googletagmanager')) {
      errors.push(`HTTP ${r.status()}: ${r.url()}`);
    }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#ccOmniInput', { timeout: 10000 });
  await page.waitForSelector('#ccAppsTooltip', { timeout: 10000 });

  // 1. Oryginalny czysty ekran startowy — podpowiedzi multimedialne UKRYTE na starcie
  const sugsHiddenAtStart = !(await page.locator('#ccOmniMediaSuggestions').evaluate((n) => n.classList.contains('is-open')));
  assert(sugsHiddenAtStart, 'Na czystym ekranie startowym podpowiedzi multimedialne są ukryte (100% oryginalny wygląd)');

  // 2. Dymek raz dziennie „Poznaj aplikacje Christian Culture” przy oryginalnym #ccOmniApps
  const tipVisible1 = await page.locator('#ccAppsTooltip').evaluate((n) => n.classList.contains('is-visible'));
  const tipText = (await page.locator('#ccAppsTooltip').innerText()).trim();
  assert(tipVisible1 && tipText.includes('Poznaj aplikacje Christian Culture'), 'Dymek „Poznaj aplikacje Christian Culture” pojawia się przy 1. wizycie dnia');

  // Kliknięcie dymka otwiera oryginalne #ccOmniAppsMenu z sekcją instalowalnych aplikacji
  await page.click('#ccAppsTooltipAction');
  await page.waitForTimeout(200);
  const installRows = await page.locator('#ccOmniAppsMenu .cc-v2-install-row').count();
  assert(installRows >= 3, `Oryginalne menu #ccOmniAppsMenu zawiera sekcję instalacji aplikacji (${installRows})`);
  await page.keyboard.press('Escape');

  // Po przeładowaniu tego samego dnia dymek NIE pojawia się drugi raz
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#ccAppsTooltip', { state: 'attached', timeout: 10000 });
  const tipVisible2 = await page.locator('#ccAppsTooltip').evaluate((n) => n.classList.contains('is-visible'));
  assert(!tipVisible2, 'Dymek NIE pojawia się drugi raz tego samego dnia (1× dziennie)');

  // 3. Brak chipów hashtagowych
  const hashtagChips = await page.locator('button, a').filter({ hasText: /^#[A-ZŻŹĆĄŚĘŁÓŃ]/ }).count();
  assert(hashtagChips === 0, `Brak chipów hashtagowych (znaleziono: ${hashtagChips})`);

  // 4. Multimedialne podpowiedzi TYLKO podczas wpisywania („apo”)
  await page.fill('#ccOmniInput', 'apo');
  await page.waitForSelector('#ccOmniMediaSuggestions.is-open .cc-v2-sug-item', { timeout: 5000 });
  const apoCount = await page.locator('#ccV2SugList .cc-v2-sug-item').count();
  const promoVisible = await page.locator('#ccV2SugPromo .cc-v2-promo-cta').isVisible();
  assert(apoCount >= 3 && promoVisible, `Podczas wpisywania „apo” pojawiają się multimedialne podpowiedzi (${apoCount}) + autoreklama „Polecane”`);

  await page.keyboard.press('ArrowDown');
  const activeCount = await page.locator('#ccV2SugList .cc-v2-sug-item.is-active').count();
  assert(activeCount === 1, 'Nawigacja ArrowDown zaznacza podpowiedź');

  await page.keyboard.press('Escape');
  const closedEsc = !(await page.locator('#ccOmniMediaSuggestions').evaluate((n) => n.classList.contains('is-open')));
  assert(closedEsc, 'Escape zamyka podpowiedzi');

  // 5. Kliknięcie ▶ Słuchaj w podpowiedzi dla „biblia audio” uruchamia audio inline
  await page.fill('#ccOmniInput', 'biblia audio');
  await page.waitForSelector('#ccOmniMediaSuggestions.is-open .cc-v2-sug-action', { timeout: 5000 });
  await page.locator('#ccV2SugList .cc-v2-sug-action', { hasText: 'Słuchaj' }).first().click();
  const miniOpen = await page.locator('#ccV2MiniPlayer').evaluate((n) => n.classList.contains('is-open'));
  assert(miniOpen, 'Kliknięcie „▶ Słuchaj” w podpowiedzi uruchamia odtwarzacz audio na miejscu');

  // 6. Kliknięcie ▶ Oglądaj w podpowiedzi otwiera YouTube lite-embed
  await page.fill('#ccOmniInput', 'rodzaju 38');
  await page.waitForSelector('#ccOmniMediaSuggestions.is-open .cc-v2-sug-action', { timeout: 5000 });
  await page.locator('#ccV2SugList .cc-v2-sug-action', { hasText: 'Oglądaj' }).first().click();
  const iframeSrc = await page.locator('#ccV2Modal iframe').first().getAttribute('src');
  assert(iframeSrc && iframeSrc.includes('youtube-nocookie.com/embed/'), `Kliknięcie „▶ Oglądaj” w podpowiedzi otwiera wideo YT na miejscu (${iframeSrc})`);

  const deskOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(deskOverflow <= 1, `Desktop 1440px overflow <= 1px (jest: ${deskOverflow}px)`);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(250);
  const mobOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(mobOverflow <= 1, `Mobile 375px overflow <= 1px (jest: ${mobOverflow}px)`);

  assert(errors.length === 0, `Zero błędów JS/HTTP 404 (błędów: ${errors.length}${errors.length ? ' -> ' + errors.join('; ') : ''})`);
  console.log('\n🎉 TEST REGRESJI /test/wyszukiwarka/ (ORYGINALNY WYGLĄD + FUNKCJE V2) — 100% PASS!');
} finally {
  await browser.close();
  server.close();
}
