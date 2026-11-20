import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  { name: 'Robert Łukasz Pio', videoId: 'z33rEkjNciY' },
  { name: 'Osobowość +', videoId: 'Al56YdVI40c' },
  { name: 'Christian Culture TV', videoId: 'OGmZpYMGve4' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', videoId: 'tPipeO1iMD0' },
  { name: 'CC Women', videoId: 'yWyj0Iz1HeA' }
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const ch of CHANNELS) {
      await openChannelStudio(page, ch.name, `/livestreaming/manage`);
      await page.waitForTimeout(3000);
      await page.goto(`https://studio.youtube.com/video/${ch.videoId}/livestreaming`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const keyVal = await page.evaluate(() => {
        const input = document.querySelector('input[type="password"], input[id*="stream-key"], [id*="stream-key-value"]');
        return input ? input.value : null;
      });

      const copyBtn = page.locator('ytcp-button:has-text("Kopiuj"), button:has-text("Kopiuj")').first();
      console.log(`Stream key for ${ch.name}:`, keyVal);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
