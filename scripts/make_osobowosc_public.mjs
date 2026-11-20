import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import fs from 'fs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Switching to Osobowość + identity...');
    const channelId = await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(4000);

    console.log('2. Navigating to standard video edit URL: https://studio.youtube.com/video/Al56YdVI40c/edit');
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/edit', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);

    const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artDir}/osobowosc_edit_real.png` });
    console.log('Saved screenshot of edit page');

    // Check visibility text
    const visText = await page.locator('ytcp-video-metadata-visibility').innerText().catch(() => '');
    console.log('Current visibility text:', visText);

    if (visText.includes('Publiczny') || visText.includes('Public')) {
      console.log('Already Public!');
    } else {
      console.log('Clicking visibility dropdown...');
      await page.locator('ytcp-video-metadata-visibility').click();
      await page.waitForTimeout(2000);

      const pubRadio = page.locator('tp-yt-paper-radio-button[name="PUBLIC"], tp-yt-paper-radio-button:has-text("Publiczny")').first();
      await pubRadio.click();
      console.log('Selected Publiczny');
      await page.waitForTimeout(1000);

      const doneVisBtn = page.locator('#save-button, ytcp-button:has-text("Gotowe")').first();
      await doneVisBtn.click();
      console.log('Clicked Gotowe');
      await page.waitForTimeout(1500);

      const saveBtn = page.locator('ytcp-button#save, button:has-text("Zapisz")').first();
      await saveBtn.click();
      console.log('Clicked Save!');
      await page.waitForTimeout(4000);
    }

    await page.screenshot({ path: `${artDir}/scheduled_Osobowosc_Plus.png` });
    console.log('Saved final scheduled_Osobowosc_Plus.png');

    // Save final result
    fs.writeFileSync('scripts/osobowosc_result.json', JSON.stringify({
      channel: 'Osobowość +',
      status: 'PUBLIC',
      videoId: 'Al56YdVI40c',
      watchUrl: 'https://youtube.com/live/Al56YdVI40c',
      timestamp: new Date().toISOString()
    }, null, 2));

  } catch (err) {
    console.error('Błąd:', err);
  } finally {
    await ctx.close();
  }
}

main();
