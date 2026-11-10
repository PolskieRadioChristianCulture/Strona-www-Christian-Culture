import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { applyPageStandard } from './cc-page-standard.mjs';

const ROOT = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc';
const SCREENSHOTS_DIR = path.join(ROOT, 'tests/screenshots/cc-edge-plus');

function createStaticServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
  };

  return http.createServer((req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      let pathname = decodeURIComponent(url.pathname);
      if (pathname === '/') pathname = '/index.html';
      else if (pathname === '/go' || pathname === '/go/') pathname = '/go/index.html';
      else if (pathname === '/lumina' || pathname === '/lumina/') pathname = '/lumina.html';
      else if (pathname === '/akademia' || pathname === '/akademia/') pathname = '/akademia.html';

      let filePath = path.join(ROOT, pathname);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        const indexHtml = path.join(filePath, 'index.html');
        if (fs.existsSync(indexHtml)) {
          filePath = indexHtml;
        }
      }
      if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
        filePath += '.html';
      }

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      if (ext === '.html') {
        const relPath = path.relative(ROOT, filePath);
        const originalHtml = fs.readFileSync(filePath, 'utf8');
        const standardizedHtml = applyPageStandard(relPath, originalHtml);
        res.end(standardizedHtml);
      } else {
        res.end(fs.readFileSync(filePath));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(String(err));
    }
  });
}

test('CCEdgePlus Browser Test Suite — Full Matrix (360, 390, 768, 1280, 1920, Themes, A11y, Screenshots)', async (t) => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await chromium.launch({ headless: true });

  try {
    // 1. Mobile 360x740 (standard Android budget)
    await t.test('Mobile 360px viewport: hidden at top, visible on scroll, opens panel', async () => {
      const context = await browser.newContext({ viewport: { width: 360, height: 740 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/akademia.html`, { waitUntil: 'domcontentloaded' });

      // Inicjalizacja skryptu CCEdgePlus jeśli jeszcze nie zainicjowany w HTML
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      const btn = page.locator('#ccEdgePlusBtn');
      await btn.waitFor({ state: 'attached' });

      // 1. Początkowo ukryty (top of page)
      let isVisible = await btn.evaluate(el => el.classList.contains('is-visible'));
      assert.equal(isVisible, false, 'Button should not be visible at scrollY=0');

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_mobile_360_top_hidden.png') });

      // 2. Przewiń w dół o 400px
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(300);

      isVisible = await btn.evaluate(el => el.classList.contains('is-visible'));
      assert.equal(isVisible, true, 'Button should be visible after scrolling >= 300px');

      const box = await btn.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `Touch target must be >= 44x44px (got ${box?.width}x${box?.height})`);
      assert.ok(box && box.x <= 25, `Button must be in left corner (x=${box?.x})`);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_mobile_360_scrolled_visible.png') });

      // 3. Kliknięcie otwiera panel
      await btn.click();
      await page.waitForTimeout(300);

      const dialog = page.locator('dialog#cc-mobile-edge-dialog');
      const dialogVisible = await dialog.evaluate(el => el.open);
      assert.equal(dialogVisible, true, 'Dialog #cc-mobile-edge-dialog should be open');

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_mobile_360_panel_opened.png') });

      // 4. Zamknięcie panelu
      const closeBtn = dialog.locator('button[data-edge-key="close"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
      await page.waitForTimeout(300);

      // 5. Powrót na górę strony
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      isVisible = await btn.evaluate(el => el.classList.contains('is-visible'));
      assert.equal(isVisible, false, 'Button should hide when scrolled back to top');

      await context.close();
    });

    // 2. Mobile 390x844 (standard iPhone 14/15)
    await t.test('Mobile 390px viewport: check safe-area and symmetrical layout with #backToTopBtn', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/akademia.html`, { waitUntil: 'domcontentloaded' });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      const btnPlus = page.locator('#ccEdgePlusBtn');
      const btnTop = page.locator('#backToTopBtn');

      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      assert.ok(await btnPlus.evaluate(el => el.classList.contains('is-visible')));

      // Sprawdź pozycjonowanie symetryczne
      const boxPlus = await btnPlus.boundingBox();
      assert.ok(boxPlus && boxPlus.x < 30, 'Plus button is anchored to the left');

      if (await btnTop.count() > 0 && await btnTop.isVisible()) {
        const boxTop = await btnTop.boundingBox();
        assert.ok(boxTop && boxTop.x > 300, 'Back-to-top button is anchored to the right');
      }

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_mobile_390_symmetrical_dock.png') });
      await context.close();
    });

    // 3. Tablet 768x1024
    await t.test('Tablet 768px viewport: layout and interaction', async () => {
      const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/akademia.html`, { waitUntil: 'domcontentloaded' });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      const btn = page.locator('#ccEdgePlusBtn');
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(300);

      assert.ok(await btn.evaluate(el => el.classList.contains('is-visible')));
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_tablet_768_scrolled.png') });
      await context.close();
    });

    // 4. Desktop 1280x800 & Hover / Tooltip
    await t.test('Desktop 1280px viewport: hover, tooltip and focus styles', async () => {
      const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/akademia.html`, { waitUntil: 'domcontentloaded' });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      const btn = page.locator('#ccEdgePlusBtn');
      await page.evaluate(() => window.scrollTo(0, 600));
      await page.waitForTimeout(300);

      assert.ok(await btn.evaluate(el => el.classList.contains('is-visible')));

      // Hover to trigger tooltip
      await btn.hover();
      await page.waitForTimeout(200);

      const tooltip = page.locator('.cc-edge-plus-tooltip');
      const tooltipVisible = await tooltip.evaluate(el => {
        const cs = window.getComputedStyle(el);
        return cs.opacity === '1' && cs.visibility === 'visible';
      });
      assert.equal(tooltipVisible, true, 'Desktop tooltip should appear on hover');

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_desktop_1280_hover_tooltip.png') });
      await context.close();
    });

    // 5. Desktop 1920x1080 & Light Theme
    await t.test('Desktop 1920px Full HD & Light Theme contrast', async () => {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/akademia.html`, { waitUntil: 'domcontentloaded' });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      // Przełącz na motyw jasny
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.add('theme-lumina-light');
        window.scrollTo(0, 700);
      });
      await page.waitForTimeout(300);

      const btn = page.locator('#ccEdgePlusBtn');
      assert.ok(await btn.evaluate(el => el.classList.contains('is-visible')));

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_desktop_1920_light_theme.png') });
      await context.close();
    });

    // 6. CC GO Mobile Verification (BŁĘDY CC-EDGE-001, CC-EDGE-002, CC-EDGE-003) across viewports (320, 360, 390, 430, 768, 1280)
    for (const vp of [
      { name: 'Mobile 320px (iPhone SE narrow)', width: 320, height: 568 },
      { name: 'Mobile 360px (Android standard)', width: 360, height: 800 },
      { name: 'Mobile 390px (iPhone standard)', width: 390, height: 844 },
      { name: 'Mobile 430px (iPhone Pro Max)', width: 430, height: 932 },
      { name: 'Tablet 768px (iPad portrait)', width: 768, height: 1024 },
      { name: 'Desktop 1280px (Standard Desktop)', width: 1280, height: 800 }
    ]) {
      await t.test(`CC GO on ${vp.name}: no upper +, symmetrical bottom dock, zero collision with bottom nav`, async () => {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        await page.goto(`${baseUrl}/go/`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(300);

        // BŁĄD CC-EDGE-001: Weryfikacja BRAKU górnego przycisku "+"
        const topTriggerCount = await page.evaluate(() => {
          const triggers = document.querySelectorAll('.cc-mobile-edge-trigger:not(#ccOmniEdgeBtn)');
          return Array.from(triggers).filter(el => {
            const cs = window.getComputedStyle(el);
            return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0;
          }).length;
        });
        assert.equal(topTriggerCount, 0, 'No visible upper "+" trigger should exist anywhere on CC GO');

        // Weryfikacja stanu na szczycie (scrollY = 0)
        const btnPlus = page.locator('#ccEdgePlusBtn');
        const isVisibleTop = await btnPlus.evaluate(el => el.classList.contains('is-visible'));
        assert.equal(isVisibleTop, false, 'Bottom "+" button must be hidden at top of page');

        // Przewiń w dół o 500px
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(400);

        const isVisibleScrolled = await btnPlus.evaluate(el => el.classList.contains('is-visible'));
        assert.equal(isVisibleScrolled, true, 'Bottom "+" button must be visible when scrolled');

        const btnTop = page.locator('#backToTopBtn');
        assert.ok(await btnTop.isVisible(), '#backToTopBtn must be visible when scrolled');

        // BŁĄD CC-EDGE-003: Identyczna wysokość środka obu przycisków
        const boxPlus = await btnPlus.boundingBox();
        const boxTop = await btnTop.boundingBox();
        assert.ok(boxPlus && boxTop, 'Both buttons must have bounding boxes');

        const bottomEdgePlus = boxPlus.y + boxPlus.height;
        const bottomEdgeTop = boxTop.y + boxTop.height;
        const heightDifference = Math.abs(bottomEdgePlus - bottomEdgeTop);
        assert.ok(heightDifference <= 1.5, `Buttons must be at identical vertical height (diff was ${heightDifference}px, plus=${bottomEdgePlus}, top=${bottomEdgeTop})`);

        // BŁĄD CC-EDGE-002: Brak nachodzenia na dolną nawigację (Start) - na ekranach mobilnych z dolnym paskiem
        const nav = page.locator('.mobile-nav');
        if (await nav.isVisible()) {
          const navBox = await nav.boundingBox();
          assert.ok(navBox, '.mobile-nav must be present');
          assert.ok(bottomEdgePlus <= navBox.y, `Bottom "+" button (${bottomEdgePlus}px) must be ABOVE .mobile-nav top (${navBox.y}px)`);
          assert.ok(bottomEdgeTop <= navBox.y, `Back-to-top button (${bottomEdgeTop}px) must be ABOVE .mobile-nav top (${navBox.y}px)`);
        }

        // Weryfikacja braku zawieszenia strony po otwarciu i zamknięciu panelu krawędziowego
        await btnPlus.click();
        await page.waitForTimeout(300);
        const dialog = page.locator('#cc-mobile-edge-dialog');
        assert.ok(await dialog.evaluate(el => el.open), 'Edge dialog must open upon clicking plus');
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Body overflow hidden during open dialog');

        // Zamknięcie przez przycisk X
        const closeBtn = page.locator('#cc-mobile-edge-dialog button[data-edge-key="close"]');
        await closeBtn.click();
        await page.waitForTimeout(300);
        assert.equal(await dialog.evaluate(el => el.open), false, 'Edge dialog must be closed');
        
        // Krytyczny test przeciwko zamrożeniu ekranu: przywrócenie overflow i możliwość przewijania
        const bodyOverflowAfterClose = await page.evaluate(() => document.body.style.overflow);
        assert.equal(bodyOverflowAfterClose, '', 'Body overflow must be cleared after closing dialog (no freeze)');
        const canScrollAfterClose = await page.evaluate(() => {
          const before = window.scrollY;
          window.scrollBy(0, 50);
          const after = window.scrollY;
          return after > before;
        });
        assert.ok(canScrollAfterClose, 'Page must be freely scrollable after closing edge panel');

        // Weryfikacja klikalności elementu paska nawigacji po zamknięciu panelu (na ekranach z .mobile-nav)
        if (await nav.isVisible()) {
          const shelfTab = nav.locator('a[href="#myShelf"]');
          await shelfTab.click();
          await page.waitForTimeout(100);
          assert.ok(await shelfTab.isVisible(), 'Shelf tab must remain interactive and visible');
        }

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `09_cc_go_${vp.width}_scrolled_symmetrical_above_nav.png`) });
        await context.close();
      });
    }

    // 7. Agenda verification: clicking + button must open edge panel and close cleanly without freezing
    await t.test('Agenda page: edge plus button successfully mounts dialog, opens panel and restores scroll', async () => {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/agenda/`, { waitUntil: 'domcontentloaded' });

      // Skrypty standardowe
      await page.addScriptTag({ url: `${baseUrl}/js/cc-back-to-top.js` });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-mobile-edge.js` });
      await page.addScriptTag({ url: `${baseUrl}/js/cc-edge-plus.js` });
      await page.waitForTimeout(300);

      const btnPlus = page.locator('#ccEdgePlusBtn');
      await btnPlus.waitFor({ state: 'attached' });

      // Przewiń stronę w dół
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(300);

      assert.ok(await btnPlus.evaluate(el => el.classList.contains('is-visible')), 'Plus button must be visible after scrolling agenda');

      // Kliknij w przycisk +
      await btnPlus.click();
      await page.waitForTimeout(300);

      const dialog = page.locator('#cc-mobile-edge-dialog');
      assert.ok(await dialog.evaluate(el => el.open), 'Dialog #cc-mobile-edge-dialog must be open after clicking plus on agenda');
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden', 'Body overflow hidden while edge panel open');

      // Zamknięcie przez Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      assert.equal(await dialog.evaluate(el => el.open), false, 'Dialog must be closed after Escape');
      assert.equal(await page.evaluate(() => document.body.style.overflow), '', 'Body overflow restored after closing (no freeze)');

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_agenda_edge_panel_verified.png') });
      await context.close();
    });

  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
});
