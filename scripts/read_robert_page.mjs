import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/livestreaming/manage', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    const bodyText = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 1000));
    console.log('Studio Body Text:', bodyText);
    console.log('Current URL:', page.url());
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
