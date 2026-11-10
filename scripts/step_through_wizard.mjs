import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(2000);

  const reuseBtn = page.locator('button:has-text("Użyj poprzednich ustawień")').first();
  await reuseBtn.click();
  await page.waitForTimeout(3000);

  // Set Title to "Christian Culture TV LIVE 🔴 24/7"
  const titleBox = page.locator('#textbox[contenteditable="true"]').first();
  if (await titleBox.isVisible().catch(() => false)) {
    await titleBox.fill('Christian Culture TV LIVE 🔴 24/7');
    console.log('Title filled.');
  }

  // Click Dalej through steps
  for (let i = 1; i <= 4; i++) {
    console.log(`Step ${i}, clicking Dalej / Gotowe...`);
    const nextBtn = page.locator('button:has-text("Dalej"), button:has-text("Gotowe"), #next-button, #done-button').last();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_step_${i}.png` });
    }
  }

  await page.waitForTimeout(4000);
  console.log('URL after wizard:', page.url());
  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\wizard_final.png', fullPage: true });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
