import { launchStudio } from './yt_studio_session.mjs';

async function checkRobertRoom() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    console.log('Navigating to Robert live room: https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming');
    await page.goto('https://studio.youtube.com/video/pI5Ht1ntwLA/livestreaming', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    const title = await page.title();
    console.log('Page Title:', title);

    const shotPath = 'C:\\Users\\czark\\.gemini\\antigravity\\brain\\efe2b5a3-471d-49c7-bfc1-2def07e07138\\robert_current_room.png';
    await page.screenshot({ path: shotPath, fullPage: true });
    console.log('Screenshot saved to:', shotPath);

    const info = await page.evaluate(() => {
      const text = document.body.innerText;
      const titleEl = document.querySelector('#video-title, #stream-title, input[name="title"], #textbox');
      const streamKeyEl = document.querySelector('#stream-key-textbox, [aria-label*="klucz"], [aria-label*="Klucz"]');
      const startBtn = document.querySelector('#start-stream-button, button:has-text("Transmituj na żywo")');
      const editBtn = document.querySelector('#edit-button, button:has-text("Edytuj")');

      return {
        titleText: titleEl ? (titleEl.value || titleEl.innerText) : 'N/A',
        hasStartBtn: !!startBtn,
        hasEditBtn: !!editBtn,
        textSnippet: text.slice(0, 1500)
      };
    });

    console.log('Room Info:', JSON.stringify(info, null, 2));

  } finally {
    await ctx.close();
  }
}

checkRobertRoom().catch(console.error);
