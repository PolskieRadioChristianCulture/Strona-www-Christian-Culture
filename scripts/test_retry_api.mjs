import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });

  const errorLogs = [];
  page.on('response', async res => {
    try {
      const text = await res.text();
      if (text.includes('error') || text.includes('ERROR') || text.includes('reason')) {
        errorLogs.push({ url: res.url(), status: res.status(), body: text.slice(0, 400) });
      }
    } catch (e) {}
  });

  await page.goto('https://studio.youtube.com/video/PcczzAgsIto/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // Click "Spróbuj ponownie" if present
  const retryBtn = page.locator('button:has-text("Spróbuj ponownie")').first();
  if (await retryBtn.isVisible().catch(() => false)) {
    console.log('Clicking Spróbuj ponownie...');
    await retryBtn.click();
    await page.waitForTimeout(3000);
  }

  console.log('Captured errors:\n', JSON.stringify(errorLogs, null, 2));

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\retry_result.png', fullPage: true });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
