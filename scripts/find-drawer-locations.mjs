import fs from 'node:fs';

const lines = fs.readFileSync('components/cc-global-chat-button.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('cc-chat-drawer') || l.includes('cc-chat-asst-showcase') || l.includes('cc-chat-header')) {
    console.log(i + 1, l.trim().slice(0, 100));
  }
});
