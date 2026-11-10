import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click "Zaplanuj transmisję" button
  console.log('Clicking "Zaplanuj transmisję"...');
  const scheduleBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję")').first();
  await scheduleBtn.click();
  await page.waitForTimeout(3000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\schedule_dialog_step1.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  // Check dialog options
  const dialogText = await page.evaluate(() => {
    const d = document.querySelector('ytcp-dialog, ytls-schedule-dialog, ytcp-uploads-dialog');
    return d ? d.innerText : document.body.innerText;
  });
  console.log('Dialog text:\n', dialogText.slice(0, 800));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
