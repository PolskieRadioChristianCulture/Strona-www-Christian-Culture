import { readFileSync } from 'node:fs';
import { CONFIG_CALL } from './apply-ga-internal-traffic.mjs';

for (const f of ['vod.html', 'lumina.html', 'test/mission-intelligence.html']) {
  const c = readFileSync(f, 'utf8');
  console.log(f, 'includes exact CONFIG_CALL?', c.includes(CONFIG_CALL));
  if (!c.includes(CONFIG_CALL)) {
    const at = c.indexOf('G-Y4EFTVBPE3');
    console.log(f, 'actual:', JSON.stringify(c.slice(at - 15, at + 240)));
  }
}
console.log('EXPECTED:', JSON.stringify(CONFIG_CALL));
