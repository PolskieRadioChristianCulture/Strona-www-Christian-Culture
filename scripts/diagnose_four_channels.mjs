import { launchStudio, openChannelStudio } from './yt_studio_session.mjs';

const CHANNELS_TO_CHECK = [
  'CC Women',
  'Katarzyna Fedków - Polska Muzyka Chrześcijańska',
  'Top Seven',
  'Worship LIVE CC',
  'Christian Culture Praise & Worship'
];

async function checkLiveStatus() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    for (const channelName of CHANNELS_TO_CHECK) {
      console.log(`\n========================================`);
      console.log(`Checking channel: ${channelName}`);
      try {
        await openChannelStudio(page, channelName, '/livestreaming');
        await page.waitForTimeout(6000);

        // Check current URL and page content
        const url = page.url();
        console.log(`Studio URL: ${url}`);

        const info = await page.evaluate(() => {
          const statusBadge = document.querySelector('.stream-status, ytls-stream-status, #status, [class*="status"]');
          const autostartToggle = document.querySelector('tp-yt-paper-toggle-button[aria-label*="autostart" i], tp-yt-paper-toggle-button[aria-label*="Auto-start" i], [aria-label*="Włącz autostart" i]');
          const goLiveBtn = document.querySelector('#go-live-button, [aria-label*="Rozpocznij transmisję" i], button:has-text("Rozpocznij transmisję")');
          const streamKeyInput = document.querySelector('input[type="password"]');
          const titleInput = document.querySelector('#title, input[aria-label*="Tytuł" i]');
          
          return {
            statusBadgeText: statusBadge ? statusBadge.innerText.trim() : null,
            autostartChecked: autostartToggle ? autostartToggle.getAttribute('aria-checked') : null,
            goLiveBtnDisabled: goLiveBtn ? (goLiveBtn.hasAttribute('disabled') || goLiveBtn.getAttribute('aria-disabled') === 'true') : null,
            goLiveBtnText: goLiveBtn ? goLiveBtn.innerText.trim() : null,
            streamKeyMasked: streamKeyInput ? (streamKeyInput.value ? streamKeyInput.value.slice(0, 4) + '...' + streamKeyInput.value.slice(-4) : 'empty') : 'not_found',
            title: titleInput ? (titleInput.value || titleInput.innerText) : null
          };
        });

        console.log(`Stream info on ${channelName}:`, info);

        // Also check /livestreaming/manage to see if there is an upcoming or live event
        await page.goto('https://studio.youtube.com/channel/' + url.split('/channel/')[1]?.split('/')[0] + '/livestreaming/manage', { waitUntil: 'domcontentloaded' }).catch(() => {});
        await page.waitForTimeout(4000);

        const manageRows = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('ytls-manage-row-renderer, ytcp-video-row'));
          return rows.slice(0, 5).map(r => {
            const titleEl = r.querySelector('#video-title, .video-title, [id*="title"]');
            const statusEl = r.querySelector('.status, [class*="status"], ytcp-video-status-cell');
            return {
              title: titleEl ? titleEl.innerText.trim() : null,
              status: statusEl ? statusEl.innerText.trim().replace(/\s+/g, ' ') : null
            };
          });
        });
        console.log(`Manage rows (top 5):`, manageRows);

      } catch (err) {
        console.error(`Error on ${channelName}:`, err.message);
      }
    }
  } finally {
    await ctx.close();
  }
}

checkLiveStatus().catch(console.error);
