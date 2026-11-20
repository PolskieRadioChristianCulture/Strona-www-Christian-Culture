import { chromium } from 'playwright';

const STREAMS = [
  { name: 'Robert Łukasz Pio', url: 'https://youtube.com/live/z33rEkjNciY', id: 'z33rEkjNciY' },
  { name: 'Osobowość +', url: 'https://youtube.com/live/Al56YdVI40c', id: 'Al56YdVI40c' },
  { name: 'Christian Culture TV', url: 'https://youtube.com/live/OGmZpYMGve4', id: 'OGmZpYMGve4' },
  { name: 'Polskie Radio CC', url: 'https://youtube.com/live/tPipeO1iMD0', id: 'tPipeO1iMD0' },
  { name: 'CC Women', url: 'https://youtube.com/live/yWyj0Iz1HeA', id: 'yWyj0Iz1HeA' }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  const results = [];

  for (const s of STREAMS) {
    console.log(`\n--- Sprawdzam: ${s.name} (${s.url}) ---`);
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    try {
      await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);

      // Handle cookie dialog if present
      const cookieBtn = page.locator('button:has-text("Odrzuć wszystko"), button:has-text("Zaakceptuj wszystko"), button:has-text("Accept all"), button:has-text("Reject all")').first();
      if (await cookieBtn.isVisible().catch(() => false)) {
        await cookieBtn.click().catch(() => {});
        await page.waitForTimeout(2000);
      }

      const info = await page.evaluate(() => {
        const title = document.title;
        const liveBadge = document.querySelector('.ytp-live-badge, [class*="live-badge"], .badge-style-type-live-now');
        const isLiveBadge = !!liveBadge;
        const bodyText = document.body.innerText;
        const isLiveText = bodyText.includes('NA ŻYWO') || bodyText.includes('LIVE') || bodyText.includes('Rozpoczęło się');
        const isWaiting = bodyText.includes('Czeka na') || bodyText.includes('Zaplanowano');
        const viewCount = document.querySelector('.view-count, #count, [class*="view-count"]')?.innerText?.trim() || '';
        const videoEl = document.querySelector('video');
        const videoPlaying = videoEl && !videoEl.paused && videoEl.currentTime > 0;
        const videoCurrentTime = videoEl ? videoEl.currentTime : null;

        return {
          title,
          isLiveBadge,
          isLiveText,
          isWaiting,
          viewCount,
          videoPlaying,
          videoCurrentTime
        };
      });

      const shotPath = `${artDir}/live_verify_${s.id}.png`;
      await page.screenshot({ path: shotPath });
      console.log(`Wynik dla ${s.name}:`, info);
      console.log(`Screenshot zapisany: ${shotPath}`);

      results.push({ ...s, ...info, shotPath });
    } catch (err) {
      console.error(`Błąd dla ${s.name}:`, err.message);
      results.push({ ...s, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n=== PODSUMOWANIE SPRAWDZENIA NA ŻYWO ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
