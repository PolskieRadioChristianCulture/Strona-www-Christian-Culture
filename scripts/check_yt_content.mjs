import { chromium } from 'playwright';

async function fixYtUpload() {
  const profileDir = 'C:/Users/czark/.youtube_browser_profile';
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: true,
    channel: 'chrome',
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });
  
  const page = await context.newPage();
  await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);
  
  // Przejdź do zakładki Treści / Content, aby zobaczyć wgrane filmy
  await page.goto('https://studio.youtube.com/channel/videos/upload', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  
  const titles = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('ytcp-video-row, ytcp-video-list-cell-video'));
    return rows.map(r => (r.innerText || '').slice(0, 100));
  });
  
  console.log("Recent YouTube Studio Videos:", titles.slice(0, 5));
  await page.screenshot({ path: 'yt_content_list.png' });
  await context.close();
}

fixYtUpload().catch(console.error);
