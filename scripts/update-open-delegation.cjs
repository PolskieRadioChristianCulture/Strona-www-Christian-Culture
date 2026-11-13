const fs = require('fs');

let js = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');

const openMarker = 'open: function (targetTab, targetPartnerId) {';
const openIdx = js.indexOf(openMarker);
if (openIdx === -1) {
  console.error('Marker not found');
  process.exit(1);
}

const before = js.slice(0, openIdx + openMarker.length);
const after = js.slice(openIdx + openMarker.length);

const addition = `
      if (!isCanonicalMessenger && window.CCUnifiedChat && targetPartnerId && targetPartnerId !== 'cc-assistant' && !String(targetPartnerId).startsWith('asystentka-')) {
        const overlay = document.getElementById('ccGlobalChatOverlay');
        if (overlay) {
          overlay.classList.remove('is-open');
          overlay.setAttribute('aria-hidden', 'true');
        }
        window.CCUnifiedChat.open({ tab: targetTab === 'members' ? 'private' : 'public', partner: targetPartnerId });
        return;
      }`;

js = before + addition + after;
fs.writeFileSync('components/cc-global-chat-button.js', js, 'utf8');
console.log('Updated CCGlobalChat.open successfully');
