import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS = [
  { name: 'Robert Łukasz Pio', id: 'z33rEkjNciY' },
  { name: 'Osobowość +', id: 'Al56YdVI40c' },
  { name: 'Christian Culture TV', id: 'OGmZpYMGve4' },
  { name: 'Polskie Radio CHRISTIAN CULTURE', id: 'tPipeO1iMD0' },
  { name: 'CC Women', id: 'yWyj0Iz1HeA' }
];

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const ch of CHANNELS) {
      await openChannelStudio(page, ch.name, '/livestreaming/manage');
      await page.waitForTimeout(3000);
      await page.goto(`https://studio.youtube.com/video/${ch.id}/livestreaming`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);

      // Find the stream key input or copy button
      const keyInfo = await page.evaluate(() => {
        const input = document.querySelector('input[type="password"]');
        const trigger = document.querySelector('ytls-ingestion-dropdown-trigger-renderer');
        return {
          keyInputVal: input ? input.value : null,
          triggerText: trigger ? trigger.innerText.trim() : null
        };
      });

      console.log(`Channel ${ch.name}:`, keyInfo);
    }
  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
