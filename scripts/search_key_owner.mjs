import { launchStudio, switchIdentity, CHANNELS } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const [name, ch] of Object.entries(CHANNELS)) {
      if (!ch.via) continue;
      try {
        await page.goto('https://www.youtube.com/channel_switcher', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        const item = page.locator('ytd-account-item-renderer', { hasText: ch.via }).first();
        if (await item.count()) {
          // Channel exists in switcher
        }
      } catch {}
    }
  } finally {
    await ctx.close();
  }
}
main().catch(console.error);
