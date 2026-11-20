import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    console.log(`\n=== Uruchamiam LIVE dla CC Women (yWyj0Iz1HeA) ===`);
    await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
    await page.waitForTimeout(3000);
    await page.goto(`https://studio.youtube.com/video/yWyj0Iz1HeA/livestreaming`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);

    const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
    console.log(`Przycisk widoczny: ${await btn.isVisible()}`);
    console.log(`Przycisk aktywny: ${await btn.isEnabled()}`);

    if (await btn.isEnabled()) {
      await btn.click();
      console.log(`Kliknięto Transmituj na żywo dla CC Women!`);
      await page.waitForTimeout(6000);
    }

    await page.screenshot({ path: `${artDir}/after_golive_women.png` });
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
