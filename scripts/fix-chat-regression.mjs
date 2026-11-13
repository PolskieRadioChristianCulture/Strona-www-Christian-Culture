import fs from 'node:fs';

const filePath = 'components/cc-global-chat-button.js';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      if (currentChatPartner.isPublic) {
        list.innerHTML = '';
        return;
      }`;

const replacementStr = `      if (currentChatPartner.isPublic) {
        list.innerHTML = \`
          <div class="cc-chat-empty-state" style="text-align:center;padding:32px 16px;color:#A5AEC4;">
            <div style="font-size:2rem;margin-bottom:8px;">🕊️</div>
            <div style="font-weight:700;color:#F7F8FC;font-size:0.95rem;margin-bottom:6px;">Czat Ogólny Społeczności LUMINA</div>
            <p style="font-size:0.82rem;line-height:1.45;max-width:320px;margin:0 auto;color:#A5AEC4;">
              Wspólnota wiary, modlitwy i dialogu. Podziel się świadectwem, zadaj pytanie lub dołącz do rozmowy!
            </p>
          </div>
        \`;
        return;
      }`;

// Handle CRLF or LF
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const isCRLF = content.includes('\r\n');
  const updatedNormalized = normalizedContent.replace(normalizedTarget, replacementStr.replace(/\r\n/g, '\n'));
  const finalContent = isCRLF ? updatedNormalized.replace(/\n/g, '\r\n') : updatedNormalized;
  fs.writeFileSync(filePath, finalContent, 'utf8');
  console.log('✅ Successfully updated components/cc-global-chat-button.js');
} else {
  console.error('❌ Could not find target in components/cc-global-chat-button.js');
}
