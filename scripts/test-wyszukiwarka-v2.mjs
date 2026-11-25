#!/usr/bin/env node
/**
 * Test regresji Playwright dla strony testowej /test/wyszukiwarka/
 * Weryfikuje Priorytety L0 #1–#4:
 * 1. Podpowiedzi podczas pisania od 2. litery („apo”), strzałki ↑↓, Esc, grafiki + autoreklama w podpowiedziach
 * 2. Brak chipów hashtagowych (#Apokalipsa itp.)
 * 3. Wyniki multimedialne na miejscu: wideo lite-embed, audio inline, lightbox grafik
 * 4. Autopromocja CC („Polecane”) + Brama Ekosystemu + 0px overflow desktop (1440px) i mobile (375px)
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
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}/test/wyszukiwarka/` });
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
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console.error: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('.cc-pillar', { timeout: 10000 });

  // 0. Ikona aplikacji w lewym górnym rogu + dymek 1× dziennie „Poznaj aplikacje Christian Culture”
  const launcherVisible = await page.locator('#ccAppsLauncherBtn').isVisible();
  assert(launcherVisible, 'Ikona aplikacji w lewym górnym rogu (#ccAppsLauncherBtn) jest widoczna');
  const tooltipText = (await page.locator('#ccAppsTooltip').innerText()).trim();
  const tooltipVisibleFirst = await page.locator('#ccAppsTooltip').evaluate((el) => el.classList.contains('is-visible'));
  assert(tooltipVisibleFirst && tooltipText.includes('Poznaj aplikacje Christian Culture'), 'Dymek „Poznaj aplikacje Christian Culture” pojawia się przy 1. wizycie dnia');

  // Kliknięcie dymka otwiera panel aplikacji z instalatorami i kafelkami ekosystemu
  await page.click('#ccAppsTooltipAction');
  const drawerOpen = await page.locator('#ccAppsDrawer').evaluate((el) => el.classList.contains('is-open'));
  const installRows = await page.locator('#ccInstallableAppsList .cc-install-row').count();
  const appTiles = await page.locator('#ccEcosystemAppsGrid .cc-app-tile').count();
  assert(drawerOpen && installRows >= 3 && appTiles >= 15, `Panel aplikacji otwiera się z sekcją instalacji (${installRows}) i pełną siatką ekosystemu (${appTiles})`);
  await page.keyboard.press('Escape');

  // Po przeładowaniu tego samego dnia dymek NIE pojawia się drugi raz (1× dziennie)
  await page.reload({ waitUntil: 'networkidle' });
  const tooltipVisibleSecond = await page.locator('#ccAppsTooltip').evaluate((el) => el.classList.contains('is-visible'));
  assert(!tooltipVisibleSecond, 'Dymek NIE pojawia się drugi raz tego samego dnia (1× dziennie)');

  // 0b. Zero hashtag chips
  const bodyText = await page.locator('body').innerText();
  const hashtagChips = await page.locator('button, a').filter({ hasText: /^#[A-ZŻŹĆĄŚĘŁÓŃ]/ }).count();
  assert(hashtagChips === 0, `Brak chipów hashtagowych (znaleziono: ${hashtagChips})`);

  // 1. Brama ekosystemu (4 filary) + brak Mission Control
  const pillars = await page.locator('.cc-pillar').count();
  assert(pillars === 4, `Brama ekosystemu ma 4 filary (${pillars})`);
  assert(!/mission control/i.test(bodyText), 'Brak jakiejkolwiek wzmianki o Mission Control');

  // 2. Podpowiedzi podczas pisania dla „apo” + strzałki + autoreklama w podpowiedziach
  await page.fill('#ccSearchInput', 'apo');
  await page.waitForSelector('#ccSuggestions.is-open .cc-sug-item', { timeout: 5000 });
  const sugItems = await page.locator('#ccSugList .cc-sug-item').count();
  assert(sugItems >= 3, `Podpowiedzi dla „apo” pojawiły się natychmiast (${sugItems} pozycji)`);
  const sugPromoVisible = await page.locator('#ccSugPromo .cc-sug-promo-cta').isVisible();
  assert(sugPromoVisible, 'Autoreklama ekosystemu („Polecane”) widoczna już w podpowiedziach');

  await page.keyboard.press('ArrowDown');
  const firstActive = await page.locator('#ccSugList .cc-sug-item.is-active').count();
  assert(firstActive === 1, 'Nawigacja strzałką w dół (ArrowDown) zaznacza podpowiedź');

  await page.keyboard.press('Escape');
  const closedAfterEsc = !(await page.locator('#ccSuggestions').evaluate((el) => el.classList.contains('is-open')));
  assert(closedAfterEsc, 'Klawisz Escape zamyka listę podpowiedzi');

  // 3. Pełne wyniki multimedialne dla „biblia audio” (wideo lite-embed + audio inline + autoreklama)
  await page.fill('#ccSearchInput', 'biblia audio');
  await page.press('#ccSearchInput', 'Enter');
  await page.waitForSelector('#ccResultsArea .cc-audio-card', { timeout: 5000 });
  const audioCount = await page.locator('#ccResultsArea .cc-audio-card').count();
  const videoCount = await page.locator('#ccResultsArea .cc-video-stage').count();
  const promoCount = await page.locator('#ccResultsArea .cc-promo-card').count();
  assert(audioCount >= 1, `Wyniki zawierają karty Audio inline (${audioCount})`);
  assert(videoCount >= 1, `Wyniki zawierają karty Wideo lite-embed (${videoCount})`);
  assert(promoCount === 1, `Wyniki zawierają 1 wyróżnioną kartę Autoreklamy „Polecane” (${promoCount})`);

  // Kliknięcie ▶ Słuchaj teraz otwiera mini-odtwarzacz audio
  await page.locator('#ccResultsArea .cc-audio-card button').first().click();
  const miniOpen = await page.locator('#ccMiniPlayer').evaluate((el) => el.classList.contains('is-open'));
  assert(miniOpen, 'Kliknięcie „▶ Słuchaj teraz” uruchamia wbudowany odtwarzacz audio');

  // Kliknięcie ▶ Oglądaj tutaj zamienia miniaturę w iframe youtube-nocookie
  await page.locator('#ccResultsArea .cc-video-play').first().click();
  const iframeSrc = await page.locator('#ccResultsArea .cc-video-stage iframe').first().getAttribute('src');
  assert(iframeSrc && iframeSrc.includes('youtube-nocookie.com/embed/'), `Wideo lite-embed uruchamia iframe na miejscu (${iframeSrc})`);

  // 4. Desktop overflow check
  const deskOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(deskOverflow <= 1, `Desktop 1440px overflow <= 1px (jest: ${deskOverflow}px)`);

  // 5. Mobile 375px check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(300);
  const mobOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(mobOverflow <= 1, `Mobile 375px overflow <= 1px (jest: ${mobOverflow}px)`);

  assert(errors.length === 0, `Zero błędów JS/konsoli (błędów: ${errors.length}${errors.length ? ' -> ' + errors.join('; ') : ''})`);
  console.log('\n🎉 TEST REGRESJI /test/wyszukiwarka/ — 100% PASS!');
} finally {
  await browser.close();
  server.close();
}
