import { chromium } from 'playwright';
import path from 'path';
import assert from 'assert';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const filePath = 'file:///' + path.resolve('badz-blisko/index.html').replace(/\\/g, '/');
  await page.goto(filePath, { waitUntil: 'networkidle' });

  // Test 1: Day 1 initial content
  const num = await page.locator('#number').textContent();
  const title = await page.locator('#title').textContent();
  assert.strictEqual(num.trim(), '01', 'Initial day is 01');
  assert.strictEqual(title.trim(), 'Zatrzymaj się.', 'Initial title matches');

  // Test 2: Click next day
  await page.click('#next');
  const num2 = await page.locator('#number').textContent();
  const title2 = await page.locator('#title').textContent();
  assert.strictEqual(num2.trim(), '02', 'Next day is 02');
  assert.strictEqual(title2.trim(), 'Nie jesteś sam.', 'Day 2 title matches');

  // Test 3: Click Day 4
  const day4Btn = page.locator('button[data-i="3"]');
  await day4Btn.click();
  const num4 = await page.locator('#number').textContent();
  assert.strictEqual(num4.trim(), '04', 'Direct day click works');

  // Test 4: Quiet button
  await page.click('#quiet');
  const msg = await page.locator('#message').textContent();
  assert.ok(msg.includes('spokojny oddech'), 'Quiet message displays');

  console.log('All interactive Playwright tests PASSED! Browser errors count:', errors.length);
  if (errors.length > 0) console.log('Errors:', errors);

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/d6fb6723-88d9-47dd-951a-c934e6675ed7/badz_blisko_playwright_verified.png', fullPage: true });

  await browser.close();
})();
