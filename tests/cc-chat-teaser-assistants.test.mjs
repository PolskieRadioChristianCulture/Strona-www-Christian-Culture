import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('cc-global-chat-button: rotating assistants and teaser bubble integration', () => {
  const code = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');

  // 1. Sprawdzenie rotacji 3 asystentek
  assert.match(code, /ROTATING_ASSISTANTS\s*=\s*\[/);
  assert.match(code, /asystentka-1/);
  assert.match(code, /asystentka-2/);
  assert.match(code, /asystentka-3/);
  assert.match(code, /asystentka-1\.webp/);
  assert.match(code, /asystentka-2\.webp/);
  assert.match(code, /asystentka-3\.webp/);
  assert.match(code, /getActiveAssistant\(\)/);

  // 2. Sprawdzenie obecności dymka Zaczepka
  assert.match(code, /id="ccChatTeaserBubble"/);
  assert.match(code, /id="ccChatTeaserAvatar"/);
  assert.match(code, /id="ccChatTeaserClose"/);
  assert.match(code, /class="cc-chat-teaser-bubble"/);

  // 3. Sprawdzenie akcji kliknięcia otwierającej Asystenta
  assert.match(code, /window\.CCGlobalChat\.open\('assistant',\s*'cc-assistant'\)/);

  // 4. Sprawdzenie styli responsywnych dla mobile
  assert.match(code, /@media\s*\(max-width:\s*768px\)/);
  assert.match(code, /\.cc-chat-teaser-bubble/);
});
