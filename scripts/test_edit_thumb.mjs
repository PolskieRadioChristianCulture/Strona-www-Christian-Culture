import { launchStudio } from './yt_studio_session.mjs';

async function main() {
  const { ctx, page } = await launchStudio({ headless: true });
  try {
    await page.goto('https://studio.youtube.com/video/KdOBA_zRU0c/edit', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    const elements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="file"]')).map(el => ({ id: el.id, name: el.name, accept: el.accept }));
      const thumbUploader = document.querySelector('ytcp-thumbnails-compact-editor-uploader, #upload-thumbnail');
      return {
        inputs,
        hasUploader: !!thumbUploader,
        uploaderHtml: thumbUploader ? thumbUploader.outerHTML.slice(0, 300) : null
      };
    });
    console.log('Result:', JSON.stringify(elements, null, 2));
  } finally {
    await ctx.close();
  }
}
main().catch(console.error);
