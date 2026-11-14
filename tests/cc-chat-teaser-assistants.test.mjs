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

test('cc-global-chat-button & cc-assistant: strict separation of General Chat vs 3 selectable Assistants', () => {
  const globalChat = fs.readFileSync('components/cc-global-chat-button.js', 'utf8');
  const assistantJs = fs.readFileSync('js/cc-assistant.js', 'utf8');

  // Rozdzielenie zakładek i strumieni w LUMI Messenger (drawer globalny)
  assert.match(globalChat, /id="ccChatModeBar"/);
  assert.match(globalChat, /id="ccModePublicBtn"[\s\S]*Czat ogólny/);
  assert.match(globalChat, /id="ccModeAssistantBtn"[\s\S]*Asystentki CC \(3\)/);
  assert.match(globalChat, /id="ccPublicChatSection"/);
  assert.match(globalChat, /id="ccAssistantChatSection"/);
  assert.match(globalChat, /id="ccChatMessagesList"/);
  assert.match(globalChat, /id="ccAssistantMessagesList"/);

  // Zawsze widoczny wybór 3 Asystentek (Rut / Lea / Noemi)
  assert.match(globalChat, /id="ccAssistantSelectorStrip"/);
  assert.match(globalChat, /id="ccAssistantSelectorStrip"[\s\S]*data-asst-id="asystentka-1"[\s\S]*Rut/);
  assert.match(globalChat, /id="ccAssistantSelectorStrip"[\s\S]*data-asst-id="asystentka-2"[\s\S]*Lea/);
  assert.match(globalChat, /id="ccAssistantSelectorStrip"[\s\S]*data-asst-id="asystentka-3"[\s\S]*Noemi/);

  // Trasowanie kompozytora wg trybu (Czat ogólny -> sendCommunityMessage, Asystentki -> sendAssistantMessage)
  assert.match(globalChat, /function setChatMode\(mode\)/);
  assert.match(globalChat, /function sendCommunityMessage\(text\)/);
  assert.match(globalChat, /chatMode === 'assistant'\)\s*\{\s*sendAssistantMessage\(text\);\s*\}\s*else\s*\{\s*sendCommunityMessage\(text\);/);
  assert.match(globalChat, /assistantHistories\[asst\.id\]/);

  // Stały pasek 3 Asystentek również w /mess (cc-assistant.js)
  assert.match(assistantJs, /id="ccAsstPickerBar"/);
  assert.match(assistantJs, /id="ccAsstPickerBar"[\s\S]*data-asst-id="asystentka-1"[\s\S]*Rut/);
  assert.match(assistantJs, /id="ccAsstPickerBar"[\s\S]*data-asst-id="asystentka-2"[\s\S]*Lea/);
  assert.match(assistantJs, /id="ccAsstPickerBar"[\s\S]*data-asst-id="asystentka-3"[\s\S]*Noemi/);
  assert.match(assistantJs, /<span class="tab-label">Asystentki CC<\/span>/);
});
