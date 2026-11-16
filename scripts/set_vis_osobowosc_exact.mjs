import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import fs from 'fs';

const SHOT_DIR = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('1. Switching to Osobowość + channel identity...');
    await openChannelStudio(page, 'Osobowość +', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    console.log('2. Navigating to: https://studio.youtube.com/video/Al56YdVI40c/edit');
    await page.goto('https://studio.youtube.com/video/Al56YdVI40c/edit', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('ytcp-video-metadata-visibility', { timeout: 45000 });
    await page.waitForTimeout(2500);

    console.log('3. Opening visibility popup...');
    await page.locator('ytcp-video-metadata-visibility').first().click();
    await page.waitForTimeout(1500);

    // Exact locator with regex ^\s*Publiczny to NOT match Niepubliczny!
    const pub = page.locator('tp-yt-paper-radio-button').filter({ hasText: /^\s*Publiczny/ }).first();
    await pub.click();
    await page.waitForTimeout(1000);
    console.log('Selected Publiczny, aria-checked =', await pub.getAttribute('aria-checked'));

    await page.screenshot({ path: SHOT_DIR + 'osobowosc_vis_public_selected.png' });

    console.log('4. Clicking Gotowe...');
    await page.locator('#save-button').filter({ hasText: 'Gotowe' }).first().click();
    await page.waitForTimeout(1500);

    console.log('5. Clicking Zapisz...');
    const save = page.locator('ytcp-button#save').first();
    await save.click();
    await page.waitForTimeout(5000);

    const vis = await page.evaluate(() => {
      const el = document.querySelector('ytcp-video-metadata-visibility');
      return el ? el.innerText.trim().replace(/\s+/g, ' ') : 'brak';
    });
    console.log('>>> Widoczność po zapisie dla Osobowość +:', vis);
    await page.screenshot({ path: SHOT_DIR + 'osobowosc_vis_public_final.png' });

    // Save final status
    fs.writeFileSync('scripts/osobowosc_result.json', JSON.stringify({
      channel: 'Osobowość +',
      status: 'PUBLIC',
      visibility: vis,
      videoId: 'Al56YdVI40c',
      watchUrl: 'https://youtube.com/live/Al56YdVI40c',
      timestamp: new Date().toISOString()
    }, null, 2));

  } catch (err) {
    console.error('BŁĄD:', err.message);
  } finally {
    await ctx.close();
  }
}

main();
