import fs from 'node:fs';

try {
  const fd = fs.openSync('C:\\Users\\czark\\.youtube_browser_profile\\Default\\Network\\Cookies', 'r');
  const stat = fs.fstatSync(fd);
  fs.closeSync(fd);
  console.log('SUCCESS! Read Cookies file size:', stat.size);
} catch (e) {
  console.error('FAILED to read Cookies:', e.message);
}
