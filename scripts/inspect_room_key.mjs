import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function checkKey() {
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  const page = ctx.pages()[0] || await ctx.newPage();

  console.log('Navigating to room D_Sy-I2Gr2Y...');
  await page.goto('https://studio.youtube.com/video/D_Sy-I2Gr2Y/livestreaming', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/scratch/room_debug.png' });

  // Find stream key element
  const keyInputs = await page.locator('input[type="password"], input#stream-key, #stream-key').all();
  for (let i = 0; i < keyInputs.length; i++) {
    const val = await keyInputs[i].getAttribute('value').catch(() => '');
    console.log(`Key Input ${i}:`, val ? val.slice(0, 4) + '****' : '(empty)');
  }

  // Look for stream key selection dropdown
  const streamKeyName = await page.locator('#stream-key-select, ytcp-select').first().innerText().catch(() => '');
  console.log('Stream key select dropdown text:', streamKeyName.replace(/\n/g, ' '));

  // Look for text in page
  const body = await page.locator('body').innerText().catch(() => '');
  const lines = body.split('\n').filter(l => l.includes('Klucz') || l.includes('sygnał') || l.includes('Brak') || l.includes('Łączenie') || l.includes('Transmisja'));
  console.log('Relevant lines:', lines.slice(0, 10));

  await ctx.close();
}

checkKey().catch(console.error);
