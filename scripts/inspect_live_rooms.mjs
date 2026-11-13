import { launchStudio } from './yt_studio_session.mjs';

async function inspectRooms() {
  const { ctx, page } = await launchStudio({ headless: true });
  const targets = [
    { name: 'Osobowość +', videoId: 'n6IfxzwXBXU' },
    { name: 'Robert Łukasz Pio', videoId: 'pI5Ht1ntwLA' },
    { name: 'CC Women', videoId: 'lHPOFYvgXvM' }
  ];

  for (const t of targets) {
    console.log(`\n=== Checking Room for ${t.name} (${t.videoId}) ===`);
    try {
      await page.goto(`https://studio.youtube.com/video/${t.videoId}/livestreaming`, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(6000);

      const title = await page.title();
      console.log('Title:', title);

      // Check stream health / status
      const statusText = await page.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('.health-status, .status-indicator, ytls-stream-health-indicator, ytls-broadcast-status-badge, ytcp-badge'));
        return badges.map(b => b.innerText.trim()).filter(Boolean).join(' | ');
      });
      console.log('Status badges:', statusText);

      // Check Go Live button
      const startBtn = page.locator('#start-stream-button, button:has-text("Transmituj na żywo")').first();
      const isVisible = await startBtn.isVisible().catch(() => false);
      const isEnabled = await startBtn.isEnabled().catch(() => false);
      console.log(`Go Live button: visible=${isVisible}, enabled=${isEnabled}`);

      // Check stream key input
      const keyInput = page.locator('#stream-key-input, input[type="password"]').first();
      const hasKey = await keyInput.count() > 0;
      console.log('Has stream key field:', hasKey);

      const artifactDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
      await page.screenshot({ path: `${artifactDir}/room_${t.videoId}.png` });
    } catch(e) {
      console.error('Error:', e.message);
    }
  }

  await ctx.close();
}
inspectRooms();
