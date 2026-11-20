import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';
import { execSync } from 'node:child_process';

function unlockProfile() {
  try {
    const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"Name='chrome.exe'\\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"`;
    const raw = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (!raw) return;
    const list = JSON.parse(raw);
    const items = Array.isArray(list) ? list : [list];
    for (const proc of items) {
      if (proc && proc.CommandLine && proc.CommandLine.includes('.youtube_browser_profile')) {
        try { process.kill(proc.ProcessId, 'SIGKILL'); } catch {}
      }
    }
  } catch {}
}

async function main() {
  unlockProfile();
  await new Promise(r => setTimeout(r, 1500));
  const { ctx, page } = await launchStudio({ headless: true });

  try {
    await openChannelStudio(page, 'Christian Culture TV', '/livestreaming/manage');
    await page.waitForTimeout(3000);

    // 1. Sprawdź wszystkie wiersze na liście /livestreaming/manage
    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('ytcp-video-row, ytls-broadcast-row, [role="row"]')).map(r => {
        const a = r.querySelector('a#video-title, a[href*="/video/"]');
        return {
          href: a ? a.href : '',
          text: r.innerText.replace(/\n+/g, ' | ').trim()
        };
      });
    });
    console.log('Wszystkie transmisje w /manage na Christian Culture TV:', JSON.stringify(rows, null, 2));

    // 2. Sprawdź główny pokój "Transmisja" (/livestreaming/dashboard -> kliknij Transmisja)
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('*'))
        .find(e => (e.innerText === 'Transmisja' || e.getAttribute('aria-label') === 'Transmisja') && e.children.length === 0);
      if (el) {
        const target = el.closest('a, button, ytcp-navigation-item, tp-yt-paper-icon-item, ytls-icon-button') || el.parentElement || el;
        target.click();
      }
    });
    await page.waitForTimeout(5000);
    console.log('URL zakładki Transmisja:', page.url());
    const dashBody = await page.evaluate(() => document.body.innerText.slice(0, 600));
    console.log('Tekst zakładki Transmisja:', dashBody.replace(/\n+/g, ' | '));

    // 3. W 7w4bIOba5Z4 sprawdź wartość klucza Default stream key oraz Splitcam Streamkey
    await page.goto('https://studio.youtube.com/video/7w4bIOba5Z4/livestreaming', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    const key1 = await page.evaluate(() => document.querySelector('input[type="password"]')?.value);
    console.log('Klucz w 7w4bIOba5Z4 (obecny):', key1);

    const trigger = page.locator('ytls-ingestion-dropdown-trigger-renderer, [id="prefix"]:has-text("Klucz:")').first();
    await trigger.click({ force: true });
    await page.waitForTimeout(1500);
    const splitOpt = page.locator('text=Splitcam Streamkey').first();
    if (await splitOpt.isVisible().catch(() => false)) {
      await splitOpt.click({ force: true });
      await page.waitForTimeout(5000);
      const key2 = await page.evaluate(() => document.querySelector('input[type="password"]')?.value);
      const body2 = await page.evaluate(() => document.body.innerText.slice(0, 400));
      console.log('Klucz w 7w4bIOba5Z4 (Splitcam):', key2);
      console.log('Status w 7w4bIOba5Z4 (Splitcam):', body2.replace(/\n+/g, ' | '));
    }

  } finally {
    await ctx.close();
  }
}

main().catch(console.error);
