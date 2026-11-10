import { execSync } from 'node:child_process';

try {
  const out = execSync('wmic process where "name=\'chrome.exe\'" get processid,commandline').toString();
  const lines = out.split(/\r?\n/);
  for (const line of lines) {
    if (line.includes('youtube_browser_profile')) {
      const match = line.match(/(\d+)\s*$/);
      if (match) {
        const pid = Number(match[1]);
        console.log('Killing orphan Chrome PID:', pid);
        try {
          process.kill(pid, 'SIGKILL');
        } catch (e) {
          console.error(e.message);
        }
      }
    }
  }
  console.log('Cleanup complete.');
} catch (e) {
  console.log('Error or no processes:', e.message);
}
