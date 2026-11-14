import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { Window } from 'happy-dom';

async function setup(isMobile = true) {
  const win = new Window();
  win.document.body.className = 'lumina-profile-standard';
  win.document.body.innerHTML = `<div class="profile-head-card"><div class="avatar-wrap"><img src="avatar.jpg"><button class="btn-video-avatar-badge">10s Wideo</button><button class="btn-lumina-replace-floating">Wymień Media</button></div><div class="head-actions"><button class="btn-action-primary"><i></i>Obserwuj</button><button title="Wyślij wiadomość"><i></i>Napisz</button><button id="btnHeaderDeleteProfile" class="btn-action-secondary btn-action-admin-delete" title="Trwale usuń ten profil z portalu LUMINA (Tylko Dowódca)" style="display:none"><i></i><span class="btn-text">Usuń profil</span></button><button id="settings" title="Ustawienia"><i></i></button><a href="/radio">Radio</a></div></div>`;
  let callback;
  const jobs = [];
  const media = { matches: isMobile, addEventListener(_type, cb) { this.change = cb; } };
  win.matchMedia = () => media;
  const source = await readFile('js/lumina-profile-actions.js', 'utf8');
  vm.runInNewContext(source, {
    window: win, document: win.document,
    MutationObserver: class { constructor(cb) { callback = cb; } observe() {} },
    requestAnimationFrame: cb => jobs.push(cb)
  });
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  return { win, media, refresh() { callback([{ addedNodes: [win.document.createElement('button')] }]); while (jobs.length) jobs.shift()(); } };
}

test('mobile keeps originals, named icons and directly discoverable delete control', async () => {
  const {win} = await setup();
  const bar = win.document.querySelector('.head-actions');
  assert.equal(bar.querySelectorAll(':scope > button').length, 3);
  assert.equal(bar.querySelector('.btn-action-primary').getAttribute('aria-label'), 'Obserwuj');
  assert.equal(bar.querySelector('#btnHeaderDeleteProfile').parentElement, bar);
  assert.equal(bar.querySelector('#btnHeaderDeleteProfile').style.display, 'none');
  assert.equal(bar.querySelectorAll('details').length, 1);
  assert.equal(bar.querySelectorAll('.profile-actions-panel > *').length, 4);
  assert.equal(win.document.querySelector('.avatar-wrap').querySelectorAll('button').length, 0);
});

test('More preserves original handlers, no duplicates, and Escape returns focus', async () => {
  const fixture = await setup();
  const {win} = fixture;
  const settings = win.document.getElementById('settings');
  let called = 0;
  settings.onclick = () => called++;
  const details = win.document.querySelector('details');
  details.open = true;
  settings.click();
  assert.equal(called, 1);
  assert.equal(details.open, false);
  fixture.refresh(); fixture.refresh();
  assert.equal(win.document.querySelectorAll('details').length, 1);
  assert.equal(win.document.querySelectorAll('button').length, 6);
  details.open = true;
  details.dispatchEvent(new win.KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  assert.equal(details.open, false);
  assert.equal(win.document.activeElement, details.querySelector('summary'));
});

test('desktop restores original action order; avatar utilities stay off the photo', async () => {
  const fixture = await setup();
  fixture.media.matches = false;
  fixture.media.change(); fixture.refresh();
  const bar = fixture.win.document.querySelector('.head-actions');
  assert.deepEqual([...bar.children].filter(e=>e.matches('button,a')).map(e=>e.id||e.tagName), ['BUTTON','BUTTON','btnHeaderDeleteProfile','settings','A']);
  assert.equal(bar.querySelector('.profile-actions-panel').children.length, 2);
  fixture.media.matches = true; fixture.media.change(); fixture.refresh();
  assert.equal(bar.querySelectorAll('details').length, 1);
  assert.equal(bar.querySelector('.profile-actions-panel').children.length, 4);
});

test('all standard profiles load the same root module and versioned CSS', async () => {
  const source = await readFile('scripts/lumina-profile-standard-regression.test.mjs','utf8');
  const names = [...source.split('];')[0].matchAll(/'([^']+\.html)'/g)].map(m=>m[1]);
  for(const file of names){
    const html = await readFile(file,'utf8');
    assert.match(html, /src="\/js\/lumina-profile-actions\.js\?v=20261008_compact_v1"/,file);
    assert.match(html, /lumina-profile-standard\.css\?v=20261114_profile_avatar_v8/,file);
  }
  const css=await readFile('css/lumina-profile-standard.css','utf8');
  assert.match(css, /min-height: 44px !important/);
  assert.match(css, /summary:focus-visible/);
  assert.match(css, /summary > \[aria-hidden\][^}]*display: inline !important/);
  assert.match(css, /font-size: 0 !important;\s*color: #ffffff !important/);
  assert.match(css, /profile-actions-more \{ display: contents !important/);
  assert.match(css, /#followBtnText, #followCountBadge[^}]*display: none !important/);
  assert.match(css, /\[style\*="display:none"\][^}]*display: none !important/);
  assert.match(css, /\.cover-badge-banner:not\(:focus-within\)[^}]*600ms ease 5s forwards/);
  assert.match(css, /@keyframes lumina-cover-caption-fade[^]*?opacity: 0; visibility: hidden/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  const video=await readFile('lumina-premium-video-avatar.js','utf8');
  assert.match(video, /wrap\._profileVideoBadge \|\| wrap\.querySelector/);
});
