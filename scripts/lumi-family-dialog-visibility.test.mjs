import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Window } from 'happy-dom';
import { renderLumiPage } from './lumi-page.mjs';

test('/mess preserves native modal visibility instead of leaving an invisible inert page', () => {
  const w = new Window();
  try {
    w.document.body.className = 'lumi-standalone';
    w.document.head.innerHTML = '<style>' + readFileSync('css/lumi-standalone.css', 'utf8') + '</style>';
    w.document.body.innerHTML = '<div id="lumiLanding">Czat TEST</div><section id="unrelated">Ukryte tło</section><dialog class="lumi-family-dialog"><button>Zamknij</button></dialog>';
    const dialog = w.document.querySelector('dialog');
    dialog.showModal();
    assert.notEqual(w.getComputedStyle(dialog).display, 'none');
    assert.equal(dialog.open, true);
    assert.equal(w.getComputedStyle(w.document.getElementById('unrelated')).display, 'none');
    dialog.close();
    assert.equal(dialog.open, false);
  } finally { w.happyDOM.abort(); }
});

test('generated /mess loads the corrected shell without replacing the chat or family engine', () => {
  const html = renderLumiPage(readFileSync('lumina.html', 'utf8'));
  assert.match(html, /lumi-standalone\.css\?v=(?:20261019_dialog1|20261112_message_menu)/);
  assert.match(html, /id="directMessagesModal"/);
  assert.match(html, /lumi-room-navigation/);
});
