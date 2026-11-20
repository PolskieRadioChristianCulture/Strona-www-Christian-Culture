import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'tPipeO1iMD0' },
  { name: 'CC Women', id: 'yWyj0Iz1HeA' }
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    for (const item of CHANNELS) {
      console.log(`\n=== Uruchamiam LIVE dla ${item.name} (${item.id}) ===`);
      await openChannelStudio(page, item.name, '/livestreaming/manage');
      await page.waitForTimeout(3000);
      await page.goto(`https://studio.youtube.com/video/${item.id}/livestreaming`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(6000);

      const btn = page.locator('button, ytcp-button').filter({ hasText: /^Transmituj na żywo$/ }).first();
      console.log(`Przycisk widoczny: ${await btn.isVisible()}`);
      console.log(`Przycisk aktywny: ${await btn.isEnabled()}`);

      if (await btn.isEnabled()) {
        await btn.click();
        console.log(`Kliknięto Transmituj na żywo dla ${item.name}!`);
        await page.waitForTimeout(3000);

        // Click confirmation if present
        const confirmBtn = page.locator('ytcp-button, button').filter({ hasText: /Transmituj na żywo|Rozpocznij/ }).last();
        if (await confirmBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
          console.log(`Zatwierdzam w oknie...`);
          await confirmBtn.click();
          await page.waitForTimeout(3000);
        }
      }

      await page.screenshot({ path: `${artDir}/after_golive_${item.id}.png` });
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
