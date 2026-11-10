import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];

  const results = {
    url: 'https://cclite.pl',
    testedAt: new Date().toISOString(),
    viewports: {}
  };

  const screenshotDir = 'C:/Users/czark/Desktop/Misja CC/JOMA_SHARED_MEMORY/audyty/cclite_20261110';
  if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const consoleLogs = [];
    const errors = [];
    page.on('console', msg => consoleLogs.push({ type: msg.type(), text: msg.text() }));
    page.on('pageerror', err => errors.push(err.message));

    const startTime = Date.now();
    let status = 0;
    try {
      const res = await page.goto('https://cclite.pl', { waitUntil: 'domcontentloaded', timeout: 15000 });
      status = res ? res.status() : 0;
      await page.waitForTimeout(3500);
    } catch (e) {
      errors.push(e.message);
    }
    const loadTimeMs = Date.now() - startTime;

    // Check DOM analysis
    const analysis = await page.evaluate(() => {
      const title = document.title;
      const scrollX = document.documentElement.scrollWidth > window.innerWidth;
      const buttons = Array.from(document.querySelectorAll('button, a.btn, [role="button"]')).map(b => {
        const r = b.getBoundingClientRect();
        const style = window.getComputedStyle(b);
        return {
          tag: b.tagName,
          text: (b.innerText || '').trim().slice(0, 30),
          ariaLabel: b.getAttribute('aria-label'),
          w: Math.round(r.width),
          h: Math.round(r.height),
          below44: (r.width > 0 && r.width < 40) || (r.height > 0 && r.height < 40),
          bg: style.backgroundColor,
          color: style.color
        };
      });

      // Blind mode / accessibility controls
      const blindBtn = document.querySelector('[data-blind-mode], #blindModeBtn, [aria-label*="niewidom" i], [title*="niewidom" i], [aria-label*="dostępn" i]');
      
      // Radio player presence
      const audio = document.querySelector('audio');
      const radioPlayBtn = document.querySelector('[data-testid="play-btn"], button.play-button, button[aria-label*="Słuchaj" i], button[aria-label*="Play" i]');

      // External links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.getAttribute('href'),
        text: (a.innerText || '').trim().slice(0, 30)
      }));

      // Check GA4
      const ga4Scripts = Array.from(document.querySelectorAll('script')).filter(s => s.src && s.src.includes('googletagmanager'));
      const hasGA4 = ga4Scripts.length > 0 || typeof window.gtag === 'function';

      // Check daily reflection (Dobrze, że jesteś / Cuda każdego dnia)
      const reflectionCard = document.querySelector('.reflection-card, [data-reflection], article');

      return {
        title,
        scrollX,
        hasGA4,
        totalButtons: buttons.length,
        buttonsBelow44: buttons.filter(b => b.below44).length,
        buttonsSample: buttons.slice(0, 15),
        hasBlindMode: !!blindBtn,
        blindModeDetails: blindBtn ? { tag: blindBtn.tagName, text: blindBtn.innerText, ariaLabel: blindBtn.getAttribute('aria-label') } : null,
        hasAudio: !!audio,
        radioPlayBtn: radioPlayBtn ? { text: radioPlayBtn.innerText, ariaLabel: radioPlayBtn.getAttribute('aria-label') } : null,
        hasReflection: !!reflectionCard,
        linksCount: links.length,
        sampleLinks: links.slice(0, 10)
      };
    }).catch(e => ({ error: e.message }));

    const screenshotPath = `${screenshotDir}/cclite_${vp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    results.viewports[vp.name] = {
      status,
      loadTimeMs,
      consoleLogsCount: consoleLogs.length,
      errors,
      analysis,
      screenshot: screenshotPath
    };
    await page.close();
  }

  await browser.close();
  const reportPath = `${screenshotDir}/cclite_audit_result.json`;
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`Audit saved to ${reportPath}`);
  console.log(JSON.stringify(results, null, 2));
}

run().catch(console.error);
