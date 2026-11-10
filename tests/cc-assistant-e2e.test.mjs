import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { renderLumiPage } from '../scripts/lumi-page.mjs';
import { handleAssistantIdeaApiRequest } from '../services/cc-assistant/idea-service.js';

const ROOT = process.cwd();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function startLocalTestServer() {
  const messHtml = renderLumiPage(fs.readFileSync(path.join(ROOT, 'lumina.html'), 'utf8'));

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname === '/api/assistant/idea') {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const bodyBuffer = Buffer.concat(chunks);
        const webReq = new Request(url.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? bodyBuffer : undefined,
        });
        const webRes = await handleAssistantIdeaApiRequest(webReq, {});
        res.statusCode = webRes.status;
        webRes.headers.forEach((v, k) => res.setHeader(k, v));
        const text = await webRes.text();
        res.end(text);
        return;
      }

      if (url.pathname === '/mess' || url.pathname === '/mess.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(messHtml);
        return;
      }

      const safeRel = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.(\/|\\|$))+/, '');
      let filePath = path.join(ROOT, safeRel);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath) && fs.existsSync(`${filePath}.html`)) {
        filePath = `${filePath}.html`;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(fs.readFileSync(filePath));
        return;
      }

      res.writeHead(204);
      res.end();
    } catch (err) {
      res.writeHead(500);
      res.end(String(err));
    }
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test('Playwright E2E-01..E2E-05 & Responsive Viewports (360px, 390px, 768px, 1280px, 1920px)', async () => {
  const { server, baseUrl } = await startLocalTestServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    // Block external Firebase/CDN calls so test runs fast and deterministically offline
    await page.route('**/*', (route) => {
      const reqUrl = route.request().url();
      if (reqUrl.startsWith(baseUrl) || reqUrl.startsWith('data:') || reqUrl.startsWith('blob:')) {
        return route.continue();
      }
      return route.fulfill({ status: 204, body: '' });
    });

    // E2E-01: Guest opens /mess, opens Asystent Christian Culture, clicks starter chip
    await page.goto(`${baseUrl}/mess`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#lumiOpenAssistant', { state: 'visible', timeout: 5000 });
    await page.click('#lumiOpenAssistant');

    await page.waitForSelector('#messengerAssistantView.cc-asst-active', { state: 'visible', timeout: 5000 });
    const welcomeText = await page.textContent('#ccAsstMessagesList');
    assert.match(welcomeText, /Asystentem Christian Culture/);

    // Click starter chip "🎧 Posłuchaj radia"
    await page.click('.cc-asst-chip[data-asst-query="Jak posłuchać radia?"]');
    const afterRadioText = await page.textContent('#ccAsstMessagesList');
    assert.match(afterRadioText, /Radio Christian Culture nadaje przez całą dobę/);
    const primaryHref = await page.getAttribute(
      '#ccAsstMessagesList .cc-asst-msg-bot:last-child .cc-asst-action-primary',
      'href'
    );
    assert.equal(primaryHref, '/');

    // E2E-02: Unknown question -> NO DEAD END
    await page.fill('#ccAsstInput', 'Czy macie kurs budowania łodzi z drewna?');
    await page.click('#ccAsstSendBtn');
    const afterUnknown = await page.textContent('#ccAsstMessagesList .cc-asst-msg-bot:last-child');
    assert.match(afterUnknown, /Nie znalazłem potwierdzonej odpowiedzi/);
    assert.match(afterUnknown, /Szukaj w Christian Culture/);
    assert.match(afterUnknown, /Kontakt z zespołem/);
    assert.match(afterUnknown, /Zgłoś brakujący temat/);

    // E2E-03: Share flow with simulated AbortError -> never claims "wysłano"
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async () => {
          const err = new Error('User cancelled');
          err.name = 'AbortError';
          throw err;
        },
      });
    });
    await page.click('#ccAsstHeaderShareBtn');
    await page.waitForSelector('#ccAsstSheetBackdrop.open', { state: 'visible' });
    const shareSheetText = await page.textContent('#ccAsstSheetBackdrop');
    assert.match(shareSheetText, /anulowane\. Nic nie zostało wysłane/);
    assert.doesNotMatch(shareSheetText, /Wysłano pomyślnie/i);

    // Keyboard Escape closes sheet
    await page.keyboard.press('Escape');
    const isSheetOpen = await page.evaluate(() =>
      document.getElementById('ccAsstSheetBackdrop').classList.contains('open')
    );
    assert.equal(isSheetOpen, false);

    // E2E-04: Idea intake form validation + submission
    await page.click('#ccAsstHeaderIdeaBtn');
    await page.waitForSelector('#ccAsstIdeaForm', { state: 'visible' });
    await page.fill('#ccAsstIdeaMissing', 'ab');
    await page.click('#ccAsstIdeaSubmitBtn');
    const validationMsg = await page.textContent('#ccAsstIdeaStatus');
    assert.match(validationMsg, /min\. 5 znaków/);

    await page.fill('#ccAsstIdeaMissing', 'Brakuje kursu biblijnego dla narzeczonych');
    await page.fill('#ccAsstIdeaUseCase', 'Przygotowanie do ślubu');
    await page.click('#ccAsstIdeaSubmitBtn');
    await page.waitForFunction(
      () => {
        const el = document.getElementById('ccAsstIdeaStatus');
        return el && el.textContent.includes('został zapisany');
      },
      { timeout: 5000 }
    );
    await page.click('#ccAsstSheetCloseBtn');

    // T21-T25: Responsive layout & 44px touch targets across all 5 viewports
    const viewports = [
      { width: 360, height: 800 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
      { width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      const metrics = await page.evaluate(() => {
        const view = document.getElementById('messengerAssistantView');
        const viewRect = view.getBoundingClientRect();
        const buttons = Array.from(
          view.querySelectorAll('.cc-asst-action-btn, .cc-asst-chip, .cc-asst-icon-btn, .cc-asst-send-btn')
        );
        const smallButtons = buttons
          .map((b) => {
            const r = b.getBoundingClientRect();
            return { text: b.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) };
          })
          .filter((b) => b.w > 0 && (b.h < 44 || b.w < 44));

        return {
          docOverflow: document.documentElement.scrollWidth > window.innerWidth,
          viewOverflow: view.scrollWidth > view.clientWidth + 1,
          viewVisible: viewRect.width > 0 && viewRect.height > 0,
          smallButtons,
        };
      });

      assert.equal(metrics.viewVisible, true, `Assistant view must be visible at ${vp.width}x${vp.height}`);
      assert.equal(metrics.docOverflow, false, `No horizontal document overflow at ${vp.width}x${vp.height}`);
      assert.equal(metrics.viewOverflow, false, `No horizontal assistant view overflow at ${vp.width}x${vp.height}`);
      assert.deepEqual(
        metrics.smallButtons,
        [],
        `All interactive controls must be >= 44x44px at ${vp.width}x${vp.height}`
      );
    }

    // E2E-05: Switch back to public chat without regression
    await page.click('#ccAsstBackToPublicBtn');
    const isAsstStillActive = await page.evaluate(() =>
      document.getElementById('messengerAssistantView').classList.contains('cc-asst-active')
    );
    assert.equal(isAsstStillActive, false);

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
});
