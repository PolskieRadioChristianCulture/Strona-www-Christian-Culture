import { chromium } from 'playwright';

const USER_DATA_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';

const TARGETS = [
  { name: 'Katarzyna Fedków', videoId: 'CIi_s5FxxKA' },
  { name: 'RCC TV 24', videoId: 'dH9DhEVUmqQ' },
  { name: 'Popraw Koronę', videoId: 'rggnFJ6T32A' },
  { name: 'Robert Łukasz Pio', videoId: 'pI5Ht1ntwLA', uploadThumbOnly: true },
];

async function processChannel(page, item) {
  console.log(`\n========================================`);
  console.log(`Processing: ${item.name} (${item.videoId})`);
  console.log(`========================================`);

  if (!item.uploadThumbOnly) {
    // 1. Wejdź do pokoju transmisyjnego i kliknij Transmituj na żywo jeśli nie zaczęto
    console.log('1. Checking livestream room...');
    await page.goto(`https://studio.youtube.com/video/${item.videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo")').first();
    if (await startBtn.isVisible().catch(() => false)) {
      const isEnabled = await startBtn.isEnabled().catch(() => false);
      if (isEnabled) {
        console.log('  Clicking Transmituj na żywo...');
        await startBtn.click();
        await page.waitForTimeout(2500);
        const confirmBtn = page.locator('ytcp-button:has-text("Transmituj na żywo"), ytcp-button:has-text("Rozpocznij"), #confirm-button').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          console.log('  ✓ Confirmed Go Live in dialog');
          await page.waitForTimeout(4000);
        }
      } else {
        console.log('  Start button not enabled or already live');
      }
    }
  }

  // 2. Wejdź do edycji wideo
  console.log('2. Entering edit page...');
  await page.goto(`https://studio.youtube.com/video/${item.videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Wgraj miniaturę jeśli dostępny input file
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    try {
      await fileInput.setInputFiles(THUMBNAIL_PATH);
      console.log('  ✓ Thumbnail uploaded');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('  Thumbnail upload notice:', e.message);
    }
  }

  // Zmień widoczność na PUBLICZNY jeśli nie jest tylko uploadThumbOnly
  if (!item.uploadThumbOnly) {
    const niepubText = page.locator('text="Niepubliczny"').first();
    const box = await niepubText.boundingBox().catch(() => null);
    if (box) {
      console.log('  Clicking visibility box...');
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(1500);

      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"]').first();
      if (await pubRadio.isVisible().catch(() => false)) {
        await pubRadio.click();
        console.log('  ✓ Selected Publiczny radio');
        await page.waitForTimeout(1000);

        const doneBtn = page.locator('ytcp-button#done-button, ytcp-button:has-text("Gotowe")').first();
        if (await doneBtn.isVisible().catch(() => false)) {
          await doneBtn.click();
          console.log('  ✓ Clicked Gotowe');
          await page.waitForTimeout(1000);
        }
      }
    }
  }

  // Kliknij Zapisz jeśli aktywny
  const saveBtn = page.locator('ytcp-button#save, #save-button, ytcp-button:has-text("Zapisz")').first();
  if (await saveBtn.isVisible().catch(() => false) && await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log('  ✓ Saved changes!');
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\final_${item.name.replace(/\s+/g, '_')}.png` });
}

async function run() {
  const browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    viewport: { width: 1400, height: 900 },
    args: ['--disable-blink-features=AutomationControlled']
  });

  const page = browser.pages()[0] || await browser.newPage();

  for (const item of TARGETS) {
    try {
      await processChannel(page, item);
    } catch (e) {
      console.error(`Error on ${item.name}:`, e.message);
    }
  }

  await browser.close();
  console.log('\nAll targets processed!');
}

run().catch(console.error);
