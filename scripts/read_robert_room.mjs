import { launchStudio } from './yt_studio_session.mjs';

async function readRoomText() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('--- Body Text snippet ---');
    console.log(bodyText.slice(0, 2000));

    // Look for edit button
    const editBtn = page.locator('button:has-text("Edytuj"), [aria-label*="Edytuj"]').first();
    console.log('Edit button exists:', await editBtn.isVisible().catch(() => false));

  } finally {
    await ctx.close();
  }
}

readRoomText().catch(console.error);
