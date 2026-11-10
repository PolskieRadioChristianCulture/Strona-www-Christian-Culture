import { launchStudio } from './yt_studio_session.mjs';

const handles = [
  '@RobertŁukaszPio',
  '@katarzynafedkow',
  '@TopSeven_CC',
  '@ToDlaCiebieGramy',
  '@CCPrayer24',
  '@ChristianCultureNetwork'
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const h of handles) {
      await page.goto(`https://www.youtube.com/${encodeURI(h)}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      const id = await page.evaluate(() =>
        document.querySelector('meta[itemprop="identifier"], meta[itemprop="channelId"]')?.content ||
        (document.querySelector('link[rel="canonical"]')?.href.match(/channel\/(UC[\w-]+)/) || [])[1] || null);
      console.log(`${h.padEnd(25)} -> Channel ID: ${id}`);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
