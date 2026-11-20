import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

async function testRobertStudio() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('Switching to Robert Łukasz Pio via openChannelStudio...');
    const channelId = await openChannelStudio(page, 'Robert Łukasz Pio', '/livestreaming/manage');
    console.log('Opened Robert Studio. Channel ID:', channelId);
    await page.waitForTimeout(6000);

    const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_manage_page.png';
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log('Saved screenshot to:', shotPath);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Page text snippet:\n', bodyText.slice(0, 1500));

  } finally {
    await ctx.close();
  }
}

testRobertStudio().catch(console.error);
