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
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';

  try {
    for (const ch of CHANNELS) {
      console.log(`Checking ${ch.name}...`);
      await openChannelStudio(page, ch.name, `/video/${ch.videoId}/livestreaming`);
      await page.waitForTimeout(6000);

      const shotPath = `${artDir}/yt_room_${ch.videoId}.png`;
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot for ${ch.name}: ${shotPath}`);

      const statusInfo = await page.evaluate(() => {
        const health = document.querySelector('[class*="health"], [class*="status"], ytls-stream-health-indicator')?.innerText?.trim() || '';
        const title = document.querySelector('[id*="title"], h1, .stream-title')?.innerText?.trim() || '';
        const isLive = document.querySelector('button:has-text("Zakończ transmisję"), [class*="live-indicator"]')?.innerText?.trim() || '';
        return { health, title, isLive };
      });
      console.log(`Status ${ch.name}:`, statusInfo);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await ctx.close();
  }
}

main();
