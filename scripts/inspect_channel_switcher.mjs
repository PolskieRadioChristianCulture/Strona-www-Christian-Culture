import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  console.log('Navigating to channel_switcher...');
  await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // List all channels listed in channel_switcher
  const items = await page.locator('ytd-account-item-renderer').all();
  console.log(`Found ${items.length} accounts in channel_switcher:`);
  for (const item of items) {
    const text = (await item.innerText()).replace(/\n+/g, ' | ');
    console.log(' - ' + text);
  }

  await ctx.close();
}

main().catch(console.error);
