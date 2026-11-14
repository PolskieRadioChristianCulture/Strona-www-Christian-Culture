import { chromium } from 'playwright';

const PROFILE_DIR = 'C:\\Users\\czark\\.youtube_browser_profile';
const THUMBNAIL_PATH = 'C:\\Users\\czark\\Christian_Culture_Projekty\\polskieradio.cc\\scripts\\thumbnail_cc.jpg';

const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
  headless: true, channel: 'chrome', viewport: { width: 1600, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
});
const page = ctx.pages()[0] || await ctx.newPage();

try {
  // 1. Ensure channel Osobowość +
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('ytd-account-item-renderer').first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(1000);
  const item = page.locator('ytd-account-item-renderer', { hasText: 'osobowośćPLUS' }).first();
  if (await item.count()) {
    await item.click();
    await page.waitForTimeout(3000);
  }

  // 2. Manage page
  await page.goto('https://studio.youtube.com/channel/UCHmPxDM2zzlUAf5ZvlotPLw/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const gate = page.locator('a:has-text("PRZEJDŹ DO YOUTUBE STUDIO"), a:has-text("GO TO YOUTUBE STUDIO")').first();
  if (await gate.isVisible().catch(() => false)) { await gate.click(); await page.waitForTimeout(4000); }

  console.log('Clicking Zaplanuj transmisję...');
  const schedBtn = page.locator('#schedule-stream-button, button:has-text("Zaplanuj transmisję")').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  const createNew = page.locator('button:has-text("Utwórz nowe")').first();
  if (await createNew.isVisible().catch(() => false)) { await createNew.click(); await page.waitForTimeout(2000); }

  // Title
  console.log('Typing title...');
  const titleInput = page.locator('#textbox[contenteditable="true"], input[aria-label*="Tytuł"]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Osobowość + LIVE 🔴 | Christian Culture TV24');
  } else {
    await page.mouse.click(400, 335);
    await page.waitForTimeout(500);
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Osobowość + LIVE 🔴 | Christian Culture TV24');
  }
  await page.waitForTimeout(1000);

  // Not for kids
  const notForKids = page.locator('tp-yt-paper-radio-button:has-text("przeznaczone dla dzieci")').last();
  if (await notForKids.isVisible().catch(() => false)) { await notForKids.click(); await page.waitForTimeout(500); }

  // Dalej 1
  let nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  else await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);

  // Dalej 2
  nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  else await page.mouse.click(1220, 880);
  await page.waitForTimeout(2500);

  // Dalej 3
  nextBtn = page.locator('#next-button, button:has-text("Dalej")').first();
  if (await nextBtn.isVisible().catch(() => false)) await nextBtn.click();
  await page.waitForTimeout(2500);

  // Publiczny
  console.log('Selecting Publiczny...');
  const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
  if (await pubRadio.isVisible().catch(() => false)) { await pubRadio.click(); await page.waitForTimeout(1000); }

  // Gotowe
  console.log('Clicking Gotowe...');
  const doneBtn = page.locator('#done-button, button:has-text("Gotowe"), ytcp-button:has-text("Gotowe")').first();
  if (await doneBtn.isVisible().catch(() => false)) await doneBtn.click();
  else await page.mouse.click(1220, 880);
  await page.waitForTimeout(8000);

  console.log('Created broadcast! Entering room...');
  const row = page.locator('ytcp-video-row a#video-title, [role="row"] a').first();
  if (await row.isVisible().catch(() => false)) {
    await row.click();
    await page.waitForTimeout(6000);
  }
  console.log('ROOM URL:', page.url());
} finally {
  await ctx.close();
}
