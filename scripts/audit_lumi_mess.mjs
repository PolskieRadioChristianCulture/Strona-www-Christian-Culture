import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const outDir = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/audyty/lumi_mess_20261110';
await fs.mkdir(outDir, { recursive: true });

const url = 'https://polskieradio.cc/mess';
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

const browser = await chromium.launch({ headless: true });
const auditResults = { testedAt: new Date().toISOString(), url, viewports: {} };

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    reducedMotion: 'reduce',
    locale: 'pl-PL'
  });
  const page = await context.newPage();
  const consoleLogs = [];
  const errors = [];
  const failedRequests = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));
  page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));

  const start = Date.now();
  let status = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    status = resp?.status() ?? null;
    await page.waitForTimeout(3000);
  } catch (e) {
    errors.push(`Navigation error: ${e.message}`);
  }
  const loadTimeMs = Date.now() - start;

  const screenshotPath = path.join(outDir, `lumi_mess_${vp.name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled' });

  // Detailed DOM inspection for LUMI MESS
  const analysis = await page.evaluate(() => {
    const doc = document.documentElement;
    const scrollX = doc.scrollWidth > window.innerWidth + 3;
    const title = document.title;

    // Check chat container / modal elements
    const hasChatRoot = !!document.querySelector('#directMessagesModal, .lumi-standalone, .lumi-chat-container, .direct-chat-shell');
    const hasDock = !!document.querySelector('#lumiDockHost, .lumi-dock, [data-lumi-dock]');
    const hasComposer = !!document.querySelector('#dmMessageInput, textarea[placeholder*="Wpisz"], .chat-composer');
    const hasHeader = !!document.querySelector('.direct-chat-header, .lumi-header, header');
    const hasEmptyState = !!document.querySelector('.dm-empty-state, .empty-state, .chat-placeholder');
    const hasIntroOverlay = !!document.querySelector('#lumiIntroOverlay, .lumi-intro-overlay');

    // Interactive elements touch target audit
    const interactiveEls = Array.from(document.querySelectorAll('button, a, input, textarea, [role="button"]'));
    let sub44Count = 0;
    const sub44Sample = [];
    for (const el of interactiveEls) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        if (!el.closest('[aria-hidden="true"], svg, .sr-only')) {
          sub44Count++;
          if (sub44Sample.length < 15) {
            sub44Sample.push({
              tag: el.tagName,
              text: (el.innerText || el.getAttribute('aria-label') || el.title || '').slice(0, 30).trim(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              classes: el.className ? String(el.className).slice(0, 50) : ''
            });
          }
        }
      }
    }

    // Inspect buttons styles
    const buttons = Array.from(document.querySelectorAll('button'));
    const btnSample = buttons.slice(0, 10).map(b => {
      const s = window.getComputedStyle(b);
      return {
        text: (b.innerText || b.getAttribute('aria-label') || '').slice(0, 25).trim(),
        width: Math.round(b.getBoundingClientRect().width),
        height: Math.round(b.getBoundingClientRect().height),
        bg: s.backgroundColor,
        color: s.color
      };
    });

    return {
      title,
      scrollX,
      totalInteractive: interactiveEls.length,
      sub44Count,
      sub44Sample,
      btnSample,
      components: {
        hasChatRoot,
        hasDock,
        hasComposer,
        hasHeader,
        hasEmptyState,
        hasIntroOverlay
      }
    };
  });

  auditResults.viewports[vp.name] = {
    status,
    loadTimeMs,
    errorsCount: errors.length,
    errors: errors.slice(0, 10),
    failedRequestsCount: failedRequests.length,
    failedRequests: failedRequests.slice(0, 5),
    analysis,
    screenshot: screenshotPath
  };

  await context.close();
}

await browser.close();

const jsonPath = path.join(outDir, 'lumi_mess_audit_result.json');
await fs.writeFile(jsonPath, JSON.stringify(auditResults, null, 2), 'utf8');
console.log(`LUMI MESS audit saved to ${jsonPath}`);
