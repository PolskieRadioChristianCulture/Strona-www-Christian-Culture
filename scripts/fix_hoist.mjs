import fs from 'node:fs';

const filePath = 'C:/Users/czark/Christian_Culture_Projekty/polskieradio.cc/app.js';
let c = fs.readFileSync(filePath, 'utf8');
const eol = c.includes('\r\n') ? '\r\n' : '\n';

const topTarget = 'import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";' + eol;
const topReplacement = topTarget + eol + '// Global YouTube audio bridge for playlist stations (CC Women)' + eol + 'var ytPlayerBridge = null;' + eol + 'var ytBridgeReady = false;' + eol + 'var ytPendingPlay = false;' + eol;

if (c.includes(topTarget)) {
  c = c.replace(topTarget, topReplacement);
  console.log('✓ Added var ytPlayerBridge at top of app.js');
} else {
  console.error('✗ topTarget not found');
}

const botTarget = 'let ytPlayerBridge = null;' + eol + 'let ytBridgeReady = false;' + eol + 'let ytPendingPlay = false;' + eol;
if (c.includes(botTarget)) {
  c = c.replace(botTarget, '');
  console.log('✓ Removed let ytPlayerBridge from bottom');
} else {
  console.error('✗ botTarget not found');
}

fs.writeFileSync(filePath, c, 'utf8');
console.log('Finished!');
