import fs from 'node:fs';

const code = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('.cc-asst-welcome-bubble'));
console.log(lines.slice(start, start + 70).join('\n'));
