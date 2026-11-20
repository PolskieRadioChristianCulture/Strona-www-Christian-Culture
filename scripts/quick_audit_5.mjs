import { chromium } from 'playwright';

const STREAMS = [
  { name: 'Robert Łukasz Pio', url: 'https://youtube.com/live/z33rEkjNciY' },
  { name: 'Osobowość +', url: 'https://youtube.com/live/Al56YdVI40c' },
  { name: 'Polskie Radio CC', url: 'https://youtube.com/live/tPipeO1iMD0' },
  { name: 'CC Women', url: 'https://youtube.com/live/yWyj0Iz1HeA' },
  { name: 'Christian Culture TV', url: 'https://youtube.com/live/OGmZpYMGve4' }
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = [];

  for (const s of STREAMS) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    try {
      await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await page.waitForTimeout(3000);
      const cookieBtn = page.locator('button:has-text("Odrzuć wszystko"), button:has-text("Zaakceptuj wszystko"), button:has-text("Accept all"), button:has-text("Reject all")').first();
      if (await cookieBtn.isVisible().catch(() => false)) await cookieBtn.click().catch(() => {});
      await page.waitForTimeout(2000);

      const status = await page.evaluate(() => {
        const text = document.body.innerText;
        const v = document.querySelector('video');
        const isLiveBadge = !!document.querySelector('.ytp-live-badge, [class*="live-badge"]');
        const isWaiting = text.includes('Czeka na') || text.includes('Zaplanowano');
        const viewCount = document.querySelector('.view-count, #count')?.innerText?.trim() || '';
        return {
          isLive: !isWaiting && (isLiveBadge || text.includes('Rozpoczęło się') || text.includes('NA ŻYWO')),
          isWaiting,
          videoTime: v ? v.currentTime : null,
          viewCount
        };
      });
      report.push({ name: s.name, url: s.url, ...status });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
}

main().catch(console.error);
