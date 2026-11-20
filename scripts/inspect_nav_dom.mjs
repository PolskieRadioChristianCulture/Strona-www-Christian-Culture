import { launchStudio } from './yt_studio_session.mjs';

async function test() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/channel/UCdo_1-cjf5TEjSfEG_rxmyw/livestreaming');
    await page.waitForTimeout(5000);

    const locators = page.locator('text=Transmisja');
    const count = await locators.count();
    console.log('text=Transmisja count:', count);
    for (let i = 0; i < count; i++) {
      const loc = locators.nth(i);
      const isVisible = await loc.isVisible();
      const text = await loc.innerText();
      console.log(`[${i}] text: "${text}", visible: ${isVisible}`);
      if (isVisible) {
        console.log(`Clicking [${i}]...`);
        await loc.click();
        await page.waitForTimeout(5000);
        console.log('After click, URL:', page.url());
        await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/top_seven_after_transmisja_click.png' });
        break;
      }
    }
  } finally {
    await ctx.close();
  }
}
test().catch(console.error);
