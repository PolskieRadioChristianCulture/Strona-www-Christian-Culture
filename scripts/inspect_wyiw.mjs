import { launchStudio } from './yt_studio_session.mjs';

async function diagnose() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    // 1. Check wyiw23R-dy4 directly
    console.log('--- Checking wyiw23R-dy4 ---');
    await page.goto('https://studio.youtube.com/video/wyiw23R-dy4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    console.log('wyiw23R-dy4 page title:', await page.title());
    console.log('wyiw23R-dy4 URL:', page.url());
    await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/wyiw23R_dy4_studio.png' });
    
    // Extract info from page
    const streamInfo = await page.evaluate(() => {
      const texts = Array.from(document.querySelectorAll('ytls-stream-status, .stream-status, #status, ytcp-button, ytls-header-renderer')).map(el => el.innerText.trim());
      return texts.filter(Boolean);
    });
    console.log('Studio elements:', streamInfo);
  } finally {
    await ctx.close();
  }
}

diagnose().catch(console.error);
