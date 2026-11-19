import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

test('all 4 Kurs Codzienny pages load versioned cc-sms-widget.js?v=20261119_sms2', () => {
  const files = [
    'akademia/kurscodzienny.html',
    'akademia/kurscodzienny/index.html',
    'kursy/kurscodzienny.html',
    'kursy/kurscodzienny/index.html',
  ];
  for (const rel of files) {
    const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    assert.match(html, /\/js\/cc-sms-widget\.js\?v=20261119_sms2/, `${rel} must reference ?v=20261119_sms2`);
  }
});

test('js/cc-sms-widget.js positions pill slightly higher and cleanly below LUMI chat FAB', () => {
  const smsJs = fs.readFileSync(path.join(ROOT, 'js', 'cc-sms-widget.js'), 'utf8');
  assert.ok(!smsJs.includes('bottom-24 right-4'), 'old hardcoded Tailwind bottom-24 right-4 must be removed');
  assert.match(smsJs, /#ccSmsFloatWidget\.cc-sms-float-widget/);
  assert.match(smsJs, /bottom:\s*max\(84px,/);
  assert.match(smsJs, /@media\s*\(min-width:\s*768px\)\s*\{[\s\S]*?right:\s*24px;[\s\S]*?bottom:\s*100px;/);
  assert.match(smsJs, /function syncSmsWithChatFab\(/);
  assert.match(smsJs, /is-custom-positioned/);
  assert.match(smsJs, /is-fab-dragging/);
});

test('components/cc-global-chat-button.js clears #ccSmsFloatWidget in setupPositionSync', () => {
  const chatJs = fs.readFileSync(path.join(ROOT, 'components', 'cc-global-chat-button.js'), 'utf8');
  assert.match(chatJs, /smsClearanceBottom/);
  assert.match(chatJs, /getElementById\('ccSmsFloatWidget'\)/);
  assert.match(chatJs, /Math\.max\(bottomOffset,\s*Math\.round\(bttBottom \+ bttH \+ 12\),\s*smsClearanceBottom\)/);
});
