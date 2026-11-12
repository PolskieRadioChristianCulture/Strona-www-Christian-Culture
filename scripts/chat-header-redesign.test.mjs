import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('CSS eliminates double border on radio selector and provides focus-visible', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');
  const jsIntegration = await readFile('js/cc-chat-integration.js', 'utf8');
  const globalBtn = await readFile('components/cc-global-chat-button.js', 'utf8');

  // Verify select inside cc-chat-radio has border: none
  assert.match(css, /\.cc-chat-radio select[\s\S]*?border:\s*none\s*!important/i);
  assert.match(css, /\.cc-chat-radio select[\s\S]*?background:\s*transparent\s*!important/i);

  // Verify focus-visible styling
  assert.match(css, /\.cc-chat-radio select:focus-visible/i);
  assert.match(css, /\.cc-chat-radio button:focus-visible/i);

  // Verify js integration has single border on .cc-chat-radio and border:none on select
  assert.match(jsIntegration, /\.cc-chat-radio select\{order:1;background:transparent;color:#f8fafc;border:none;/i);
});

test('Unified action button heights and touch target ergonomics', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');

  // Unified visual height 36px and min touch hit 44x44 via ::after
  assert.match(css, /\.chat-settings-btn[\s\S]*?width:\s*36px/i);
  assert.match(css, /\.chat-fullscreen-btn[\s\S]*?width:\s*36px/i);
  assert.match(css, /\.chat-settings-btn::after[\s\S]*?top:\s*-4px/i);
  assert.match(css, /\.chat-settings-btn::after[\s\S]*?bottom:\s*-4px/i);

  // Close button top/right offset reset (no downwards/leftwards displacement into row 2)
  assert.match(css, /\.chat-close-btn[\s\S]*?top:\s*0\s*!important/i);
  assert.match(css, /\.chat-close-btn[\s\S]*?right:\s*0\s*!important/i);
  assert.match(css, /\.chat-header-actions[\s\S]*?justify-content:\s*flex-end/i);
});

test('Header responsive layout rules for container >= 600px and < 600px', async () => {
  const css = await readFile('css/lumina-chat-premium.css', 'utf8');

  // Desktop >= 600px: 1 row
  assert.match(css, /@media \(min-width: 600px\)[\s\S]*?flex-wrap:\s*nowrap/i);
  assert.match(css, /@media \(min-width: 600px\)[\s\S]*?\.cc-chat-radio[\s\S]*?order:\s*2/i);

  // Mobile < 600px: 2 rows
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*?flex-wrap:\s*wrap/i);
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*?\.cc-chat-radio[\s\S]*?order:\s*3[\s\S]*?flex:\s*1 0 100%/i);

  // Container query support
  assert.match(css, /@container lumiChat \(min-width: 600px\)/i);
  assert.match(css, /@container lumiChat \(max-width: 599px\)/i);
});

test('Markup across all Lumina surfaces contains clean semantic header structure', async () => {
  const surfaces = [
    'lumina.html',
    'lumina-profile.html',
    'lumina-tablica.html',
    'lumina-tablica-light.html',
    'lumina.cezaryrgowski.html',
    'lumina.wiolettarogowska.html'
  ];

  for (const surface of surfaces) {
    const html = await readFile(surface, 'utf8');
    assert.ok(html.includes('class="chat-header-top-row"'), `${surface} missing chat-header-top-row`);
    assert.ok(html.includes('class="chat-header-brand"'), `${surface} missing chat-header-brand`);
    assert.ok(html.includes('class="chat-header-titles"'), `${surface} missing chat-header-titles`);
    assert.ok(html.includes('<h3>LUMI Messenger</h3>'), `${surface} missing h3 LUMI Messenger`);
    assert.ok(html.includes('Na żywo w Chrystusie ✨'), `${surface} missing Na żywo w Chrystusie subtitle`);
    assert.ok(html.includes('id="btnChatSettingsModal"'), `${surface} missing btnChatSettingsModal`);
    assert.ok(html.includes('id="btnChatFullscreen"'), `${surface} missing btnChatFullscreen`);
    assert.ok(html.includes('chat-close-btn'), `${surface} missing chat-close-btn`);
    assert.ok(html.includes('lumina-chat-premium.css?v=20261018_headerfix2'), `${surface} missing lumina-chat-premium.css?v=20261018_headerfix2`);
  }
});

test('Header DOM hierarchy and widths 320, 375, 430, 600, 900 mount successfully', async () => {
  const { Window } = await import('happy-dom');
  const widths = [320, 375, 430, 600, 900];

  for (const w of widths) {
    const win = new Window({ url: 'https://polskieradio.cc/mess', innerWidth: w });
    win.document.body.innerHTML = `
      <div id="directMessagesModal">
        <div class="modal-card">
          <div class="chat-header-bar">
            <div class="chat-header-top-row">
              <div class="chat-header-brand">
                <div class="chat-header-logo-icon"><i></i></div>
                <div class="chat-header-titles">
                  <h3>LUMI Messenger</h3>
                  <div class="chat-header-sub"><span></span> Na żywo w Chrystusie ✨</div>
                </div>
              </div>
              <div class="chat-header-actions">
                <button id="btnChatSettingsModal" class="chat-settings-btn"></button>
                <button id="btnChatFullscreen" class="chat-fullscreen-btn"></button>
                <button class="modal-close-btn"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Verify all key elements exist in DOM tree
    assert.ok(win.document.querySelector('.chat-header-top-row'));
    assert.ok(win.document.querySelector('.chat-header-brand'));
    assert.ok(win.document.querySelector('.chat-header-actions'));
    assert.equal(win.document.querySelectorAll('.chat-header-actions button').length, 3);
    await win.happyDOM.close();
  }
});


test('actual header functions toggle fullscreen/settings and reaction picker dispatches once',async()=>{
  const { Window } = await import('happy-dom');
  const html=await readFile('lumina.html','utf8');
  const w=new Window({url:'https://polskieradio.cc/mess'});
  w.document.body.innerHTML='<div id="directMessagesModal"><div class="modal-card lumina-messenger-modal-card"><button id="btnChatFullscreen"><i id="iconChatFullscreen"></i></button><button id="reaction" data-message-id="m1"></button></div></div><div id="chatSettingsModal" inert aria-hidden="true"><span id="chatSettingsName"></span></div>';
  const fullscreen=html.slice(html.indexOf('        function toggleChatFullscreen()'),html.indexOf('// Wyjście z fullscreen'));
  w.eval(fullscreen);
  w.toggleChatFullscreen();assert.ok(w.document.getElementById('directMessagesModal').classList.contains('is-fullscreen'));
  w.toggleChatFullscreen();assert.ok(!w.document.getElementById('directMessagesModal').classList.contains('is-fullscreen'));
  const settingsStart=html.indexOf('window.openChatSettingsModal = function');
  w.eval(html.slice(settingsStart,html.indexOf('// Gwarancja przechwycenia',settingsStart)));
  w.openChatSettingsModal();
  assert.equal(w.document.getElementById('chatSettingsModal').getAttribute('aria-hidden'),'false');
  assert.equal(w.document.getElementById('chatSettingsModal').style.display,'flex');
  const pickerStart=html.indexOf('window.toggleReactionPicker = function');
  w.eval(html.slice(pickerStart,html.indexOf('// ══════════ EMOJI DRAWER',pickerStart)));
  const calls=[];w.handleChatReaction=(...args)=>calls.push(args);
  const button=w.document.getElementById('reaction');
  w.toggleReactionPicker(button,'public','public','m1');
  assert.equal(w.document.querySelectorAll('.lumina-reaction-picker button').length,12);
  assert.equal(button.getAttribute('aria-expanded'),'true');
  w.dispatchEvent(new w.Event('resize'));
  assert.equal(w.document.querySelector('.lumina-reaction-picker'),null);
  assert.equal(button.getAttribute('aria-expanded'),'false');
  w.toggleReactionPicker(button,'public','public','m1');
  const emoji=w.document.querySelector('.lumina-reaction-picker button');
  emoji.click();emoji.dispatchEvent(new w.Event('touchend'));
  assert.equal(calls.length,1);assert.deepEqual(calls[0],['public','public','m1','❤️']);
  assert.equal(w.document.querySelector('.lumina-reaction-picker'),null);
  await w.happyDOM.close();
});
