import { launchStudio } from './yt_studio_session.mjs';

async function testEdit() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    const videoId = 'D_Sy-I2Gr2Y'; // Christian Culture TV
    console.log(`Navigating to https://studio.youtube.com/video/${videoId}/edit...`);
    await page.goto(`https://studio.youtube.com/video/${videoId}/edit`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(5000);

    const title = await page.title();
    const url = page.url();
    console.log('Page title:', title);
    console.log('Page url:', url);

    const fileInput = page.locator('input[type="file"]');
    const inputCount = await fileInput.count();
    console.log('File inputs found:', inputCount);

    const saveBtn = page.locator('#save, ytcp-button#save-button, ytcp-button:has-text("Zapisz")').first();
    console.log('Save button visible:', await saveBtn.isVisible().catch(() => false));

    const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
    await page.screenshot({ path: `${artifactDir}/test_edit_screen.png` });
    console.log('Screenshot saved to test_edit_screen.png');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await ctx.close();
  }
}
testEdit();
