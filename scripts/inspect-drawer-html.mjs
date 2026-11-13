import fs from 'node:fs';

const code = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');
const lines = code.split('\n');
console.log(lines.slice(1930, 2070).join('\n'));
