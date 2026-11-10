import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/channel/UCG5Y4dwJi5436Gu6QH3nNUQ/livestreaming/manage?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\cctv_manage_tab.png';
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Manage tab screenshot saved to:', shotPath);

  const text = await page.evaluate(() => document.body.innerText);
  console.log('Manage tab text snippet:\n', text.slice(0, 1000));

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
