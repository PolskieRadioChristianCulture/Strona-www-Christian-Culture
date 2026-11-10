import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_wizard_dialog.png' });

  // Print all buttons in the dialog
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-dialog button, ytcp-dialog ytcp-button')).map(b => b.innerText.trim());
  });
  console.log('Dialog buttons:', btns);

  await ctx.close();
}

main().catch(console.error);
