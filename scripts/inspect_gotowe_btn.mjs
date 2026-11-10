import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  await page.goto('https://studio.youtube.com/video/n6IfxzwXBXU/livestreaming?approve_browser_access=true', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const btns = await page.evaluate(() => {
    const list = Array.from(document.querySelectorAll('*'));
    const matched = list.filter(e => e.innerText === 'Gotowe' || e.innerText === 'Więcej informacji');
    return matched.map(e => ({
      tag: e.tagName,
      text: e.innerText,
      id: e.id,
      className: e.className,
      outerHTML: e.outerHTML.slice(0, 200),
      parentTag: e.parentElement?.tagName
    }));
  });

  console.log('Gotowe buttons found:\n', JSON.stringify(btns, null, 2));

  // Click it directly in page.evaluate!
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const btn = all.find(e => e.innerText === 'Gotowe' && e.children.length === 0);
    if (btn) {
      const clickTarget = btn.closest('button, ytcp-button') || btn;
      clickTarget.click();
      return 'clicked: ' + clickTarget.tagName;
    }
    return 'not found';
  });
  console.log('Evaluate click result:', clicked);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\after_eval_gotowe.png' });

  await ctx.close();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
