import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Navigating to https://www.youtube.com/@ChristianCultureTV/live...');
  await page.goto('https://www.youtube.com/@ChristianCultureTV/live', { waitUntil: 'networkidle' });
  console.log('Final URL:', page.url());
  const playerState = await page.evaluate(() => {
    const moviePlayer = document.getElementById('movie_player');
    if (!moviePlayer) return { hasPlayer: false };
    return {
      hasPlayer: true,
      playerState: typeof moviePlayer.getPlayerState === 'function' ? moviePlayer.getPlayerState() : null,
      videoLoaded: typeof moviePlayer.getVideoData === 'function' ? moviePlayer.getVideoData() : null,
    };
  });
  console.log('Player state:', JSON.stringify(playerState, null, 2));
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body snippet:\n', bodyText);
  await page.screenshot({ path: 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/cctv_headless_live.png' });
  await browser.close();
}

main().catch(console.error);
