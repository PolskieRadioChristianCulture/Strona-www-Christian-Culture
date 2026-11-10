import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'CC Women', '/livestreaming/manage');
  await page.waitForTimeout(5000);

  const schedBtn = page.locator('button:has-text("Zaplanuj transmisję"), ytcp-button:has-text("Zaplanuj transmisję"), #schedule-stream-button').first();
  await schedBtn.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cc_women_step1.png' });

  // Check what buttons exist right now
  const btns = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-dialog button, ytcp-dialog ytcp-button')).map(b => ({
      text: b.innerText.trim(),
      id: b.id,
      disabled: b.disabled || b.getAttribute('aria-disabled')
    }));
  });
  console.log('Step 1 buttons:', JSON.stringify(btns, null, 2));

  await ctx.close();
}

main().catch(console.error);
