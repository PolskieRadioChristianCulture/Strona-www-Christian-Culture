import { launchStudio } from './yt_studio_session.mjs';
import path from 'node:path';

const THUMBNAIL_PATH = path.resolve('scripts/thumbnail_niepodleglosc_20261111.jpg');

async function testUpload() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'D_Sy-I2Gr2Y'; // Christian Culture TV
    console.log(`Navigating to https://studio.youtube.com/video/${videoId}/edit...`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(4000);

    const fileInput = page.locator('input[type="file"]').first();
    console.log('Attaching thumbnail:', THUMBNAIL_PATH);
    await fileInput.setInputFiles(THUMBNAIL_PATH);
    await page.waitForTimeout(3000);

    // Check save button
    const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz")').first();
    const isSaveEnabled = await saveBtn.isEnabled().catch(() => false);
    console.log('Save button enabled:', isSaveEnabled);

    if (isSaveEnabled) {
      console.log('Clicking Zapisz...');
      await saveBtn.click();
      await page.waitForTimeout(5000);
      console.log('✓ Saved successfully!');
    } else {
      console.log('⚠️ Save button not enabled, checking if auto-saved or options button needed');
    }

    const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artifactDir}/after_upload_cctv.png` });
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await ctx.close();
  }
}
testUpload();
