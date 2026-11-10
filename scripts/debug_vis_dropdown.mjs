import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';

async function run() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/edit', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Kliknij dokładnie w pole widoczności po prawej stronie
  // Znajdźmy po selektorze zawierającym 'Niepubliczny'
  const trigger = page.locator('#visibility-button, [class*="visibility"], div[role="button"]:has-text("Niepubliczny")').first();
  console.log('Trigger visible:', await trigger.isVisible());
  await trigger.click();
  await page.waitForTimeout(1500);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\vis_dropdown_open.png' });

  // Pokaż wszystkie radio buttony na stronie
  const radios = await page.locator('tp-yt-paper-radio-button').all();
  console.log(`Found ${radios.length} paper-radios:`);
  for (let i = 0; i < radios.length; i++) {
    const txt = (await radios[i].innerText().catch(() => '')).trim();
    const name = await radios[i].getAttribute('name').catch(() => '');
    console.log(`radio[${i}] name="${name}" text="${txt}"`);
  }

  await browser.close();
}

run().catch(console.error);
