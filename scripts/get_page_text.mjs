import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming');
  await page.waitForTimeout(4000);
  const t = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' '));
  console.log('TEKST:', t);
  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_live_current.png';
  await page.screenshot({ path: shot });
  console.log('Shot:', shot);
  await ctx.close();
}

main();
