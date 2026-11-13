import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/suYDIRikPjQ/edit', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const shot = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\video_edit_page.png';
  await page.screenshot({ path: shot, fullPage: true });

  const interactive = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ytcp-dropdown-trigger, [aria-haspopup], [id*="visibility"]')).map(el => ({
      tag: el.tagName,
      id: el.id,
      text: el.innerText.replace(/\n+/g, ' ').slice(0, 100),
      label: el.getAttribute('aria-label')
    }));
  });
  console.log('Interactive visibility elements:', JSON.stringify(interactive, null, 2));

  await ctx.close();
}

main().catch(console.error);
