import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {Window} from 'happy-dom';
import {renderLumiPage} from './lumi-page.mjs';
test('dedicated LUMI page reuses the complete canonical chat with separate SEO and app identity', async () => {
  const canonical = await readFile('lumina.html', 'utf8');
  const win = new Window({settings:{disableJavaScriptEvaluation:true,disableCSSFileLoading:true}});
  win.document.body.innerHTML = renderLumiPage(canonical);
  const doc = win.document;
  assert.equal(doc.querySelector('link[rel="manifest"]').getAttribute('href'), '/manifest-lumi.json');
  assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute('href'), 'https://polskieradio.cc/mess');
  assert.equal(doc.querySelector('#lumiTitle').textContent, 'LUMI Messenger');
  for (const id of ['directMessagesModal','activeChatInput','messengerPrivateView','messengerPublicView','lumiInstall','lumiInstallHelp']) assert.ok(doc.getElementById(id), id);
  assert.ok(!doc.querySelector('script[src^="lumina-pwa-installer.js"]'));
  const manifest = JSON.parse(await readFile('manifest-lumi.json','utf8'));
  assert.equal(manifest.name,'LUMI Messenger'); assert.equal(manifest.start_url,'/mess?source=lumi_app');
  for (const file of ['manifest.json','manifest-lumina.json']) assert.notEqual(manifest.id,JSON.parse(await readFile(file,'utf8')).id);
  const redirects = await readFile('_redirects','utf8');
  for (const alias of ['czat','lumi','messenger','lumimess']) assert.match(redirects,new RegExp('^/'+alias+' /mess 301$','m'));
  assert.throws(()=>renderLumiPage('<html><body></body></html>'), /contract/);
});
test('LUMI install fallback, cancellation and existing chat entry execute without fake success', async () => {
  const source = await readFile('js/lumi-standalone.js','utf8');
  const win = new Window(); win.document.body.innerHTML='<button id="lumiOpen"></button><button id="lumiInstall"></button><p id="lumiInstallStatus"></p><details id="lumiInstallHelp"></details><button id="ccChatFabBtn"></button>';
  const calls=[];
  win.CCGlobalChat={open:tab=>calls.push(['guest',tab])}; win.openDirectMessagesModal=tab=>calls.push(['native',tab]);
  win.LuminaDB={getCurrentUser:()=>null}; win.matchMedia=()=>({matches:false});
  const nav={serviceWorker:{register:async(...args)=>{calls.push(['worker',...args]);}}};
  vm.runInContext(source,vm.createContext({window:win,document:win.document,navigator:nav,location:win.location,URLSearchParams}));
  win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
  win.document.getElementById('lumiOpen').click(); assert.deepEqual(calls.at(-1),['native','public']);
  win.LuminaDB.getCurrentUser=()=>({uid:'SyntheticOwner'});
  win.document.getElementById('lumiOpen').click(); assert.deepEqual(calls.at(-1),['native','public']);
  const install=win.document.getElementById('lumiInstall'); install.click();
  assert.equal(win.document.getElementById('lumiInstallHelp').open,true);
  const prompt=new win.Event('beforeinstallprompt',{cancelable:true});
  let prompts=0; prompt.prompt=async()=>{prompts++;}; prompt.userChoice=Promise.resolve({outcome:'dismissed'});
  win.dispatchEvent(prompt); assert.equal(prompt.defaultPrevented,true); install.click();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(prompts,1); assert.match(win.document.getElementById('lumiInstallStatus').textContent,/anulowana/); assert.equal(install.disabled,false);
  assert.equal(calls.filter(x=>x[0]==='worker').length,1);
  assert.ok(!/caches\.delete|localStorage|requestPermission/.test(source));
});
test('notification bubble routes to the exact conversation, including fallback and keyboard',async()=>{
 const source=await readFile('lumina-db.js','utf8');
 const start=source.indexOf('export function openNotificationChat(');
 const end=source.indexOf('export async function showSystemDrawerNotification(',start);
 assert.ok(start>0&&end>start);
 const escapeStart=source.indexOf('export function escapeHtml(');
 const escapeEnd=source.indexOf('\n}',escapeStart)+2;
 const code=source.slice(start,end).replaceAll('export function ','function ')+source.slice(escapeStart,escapeEnd).replace('export ','');
 function fixture({guest=false,native=true,fail=false}={}){
  const dom=new Window(),calls=[];
  if(native)dom.document.body.innerHTML='<div id="directMessagesModal"></div>';
  if(guest)dom.document.body.classList.add('user-is-guest');
  const win={location:{origin:'https://polskieradio.cc',assign:url=>calls.push(['navigate',url])},
   CCGlobalChat:{close:()=>calls.push(['close']),open:(...args)=>calls.push(['global',...args])},
   _luminaBannerTimeout:null};
  if(native){win.openChatWith=(...args)=>{if(fail)throw Error('UI unavailable');calls.push(['private',...args]);};
   win.openDirectMessagesModal=(tab)=>{if(fail)throw Error('UI unavailable');calls.push(['public',tab]);};
   win.switchMessengerMainTab=tab=>calls.push(['tab',tab]);}
  const ctx=vm.createContext({window:win,document:dom.document,URL,
   requestAnimationFrame:fn=>fn(),setTimeout:()=>1,clearTimeout:()=>{}});
  vm.runInContext(code+';window.openNotificationChat=openNotificationChat;window.showInAppChatBanner=showInAppChatBanner;',ctx);
  return{win,dom,calls,banner:data=>win.showInAppChatBanner(data)};
 }
 const f=fixture();
 f.banner({type:'private',senderId:'MemberUID_A',senderName:'Synthetic member',messageId:'msg-A'});
 let bubble=f.dom.document.getElementById('lumina-chat-notification-banner');bubble.click();
 assert.deepEqual(f.calls,[['close'],['private','Synthetic member','/lumina_icon.jpg','MemberUID_A','msg-A']]);
 // Reused bubble must route to the NEW notification, not the previous recipient.
 f.banner({type:'private',senderId:'MemberUID_B',senderName:'Second fixture'});bubble.click();
 assert.equal(f.calls.at(-1)[3],'MemberUID_B');
 const keyboard=new f.dom.KeyboardEvent('keydown',{key:'Enter',bubbles:true});
 bubble.dispatchEvent(keyboard);assert.equal(f.calls.at(-1)[3],'MemberUID_B');
 assert.equal(bubble.getAttribute('role'),'button');assert.equal(bubble.tabIndex,0);
 for(const type of ['public','public_chat','chat_public']){
  const p=fixture();p.banner({type,senderId:'do-not-open-private'});p.dom.document.getElementById('lumina-chat-notification-banner').click();
  assert.deepEqual(p.calls,[['close'],['public','public'],['tab','public']]);
 }
 const guest=fixture({guest:true});guest.win.openNotificationChat({type:'public'});
 assert.deepEqual(guest.calls,[['global','live','public']]);
 for(const options of [{native:false},{fail:true},{guest:true}]){
  const p=fixture(options);p.win.openNotificationChat({type:'private',senderId:'MemberUID_A',messageId:'msg-B'});
  const dest=new URL(p.calls.at(-1)[1]);assert.equal(dest.origin,'https://polskieradio.cc');
  assert.equal(dest.pathname,'/lumina');assert.equal(dest.searchParams.get('openChat'),'MemberUID_A');
  assert.equal(dest.searchParams.get('messageId'),'msg-B');
 }
 const pub=fixture({native:false});pub.win.openNotificationChat({type:'public'});
 assert.equal(new URL(pub.calls.at(-1)[1]).searchParams.get('openPublicChat'),'1');
 const invalid=fixture();assert.equal(invalid.win.openNotificationChat({type:'private'}),false);
 assert.deepEqual(invalid.calls,[]);
 const attack=fixture();
 const unsafe='<img src=x onerror="window.attacked=true"><script>window.attacked=true</script>';
 attack.banner({type:'private',senderId:'FixtureUID',senderName:unsafe,body:unsafe,avatar:'javascript:alert(1)'});
 const safeBubble=attack.dom.document.getElementById('lumina-chat-notification-banner');
 assert.equal(safeBubble.querySelectorAll('img').length,1);
 assert.equal(safeBubble.querySelectorAll('script,[onerror],[onload]').length,0);
 assert.ok(safeBubble.textContent.includes(unsafe));
 assert.equal(safeBubble.querySelector('img').getAttribute('src'),'/lumina_icon.jpg');
 attack.banner({type:'private',senderId:'FixtureUID',avatar:'" onerror="alert(1)'});
 assert.equal(safeBubble.querySelectorAll('[onerror]').length,0);
});

test('notification list treats cached and received fields as text and restricts navigation',async()=>{
 const source=await readFile('lumina-notifications.js','utf8');
 const classStart=source.indexOf('    class LuminaNotificationEngine');
 const helperStart=source.indexOf('    function safeNotificationUrl');
 const helperEnd=source.indexOf('    function escapeHtml',helperStart);
 const dom=new Window();dom.document.body.innerHTML='<div id="notif-list"></div>';
 const calls=[];const win={location:{origin:'https://polskieradio.cc',href:'https://polskieradio.cc/akademia/example'},openChatWith:(...args)=>calls.push(['private',...args])};
 const ctx=vm.createContext({window:win,document:dom.document,URL});
 const proto=vm.runInContext(source.slice(classStart,helperStart)+source.slice(helperStart,helperEnd)+';LuminaNotificationEngine.prototype',ctx);
 const engine=Object.create(proto);engine.updateBadge=()=>{};engine.saveToStorage=()=>{};
 const attack='<svg onload="window.attacked=true"></svg>';
 engine.notifications=[{id:"bad');alert(1);//",title:attack,body:attack,time:attack,icon:'javascript:alert(1)',actionUrl:'javascript:alert(1)'},
  {id:'safe-fixture',title:'Zażółć gęślą jaźń',body:'Test',icon:'/avatar_fixture.png',actionUrl:'/lumina?openChat=FixtureUID'}];
 engine.renderList();
 const list=dom.document.getElementById('notif-list');
 assert.equal(list.querySelectorAll('.notif-item').length,2);
 assert.equal(list.querySelectorAll('script,svg,[onclick],[onerror],[onload]').length,0);
 assert.ok(list.textContent.includes(attack));assert.ok(list.textContent.includes('Zażółć gęślą jaźń'));
 assert.equal(list.querySelector('img').getAttribute('src'),'/lumina_icon.jpg');
 list.querySelector('.notif-item').click();assert.equal(win.location.href,'https://polskieradio.cc/akademia/example');
 list.querySelectorAll('.notif-item')[1].dispatchEvent(new dom.KeyboardEvent('keydown',{key:' ',bubbles:true}));
 assert.equal(calls.at(-1)[3],'FixtureUID');
 for(const url of ['javascript:alert(1)','data:text/html,test','https://example.invalid/', '//example.invalid/', 'https://user:pass@polskieradio.cc/','http://[']){
  const count=calls.length;engine.handleItemClick('unknown',url);assert.equal(calls.length,count);assert.equal(win.location.href,'https://polskieradio.cc/akademia/example');
 }
 engine.handleItemClick('safe','/akademia/kurscodzienny/dzien-08');
 assert.equal(win.location.href,'https://polskieradio.cc/akademia/kurscodzienny/dzien-08');
});

const surfaces=['lumina.html','lumina-tablica.html','lumina-tablica-light.html','lumina-profile.html','lumina.cezaryrgowski.html','lumina.wiolettarogowska.html'];
const draftsSource = await readFile('js/lumi-chat-drafts.js', 'utf8');
function draftFixture() {
  const win = new Window();
  win.document.body.innerHTML = '<input id="activeChatInput">';
  let user = {uid: 'SyntheticOwnerA'};
  win.LuminaDB = {getCurrentUser: () => user};
  vm.runInContext(draftsSource, vm.createContext({window: win, document: win.document, Event: win.Event}));
  const input = win.document.querySelector('input');
  return {win, input, api: win.LumiChatDrafts,
    type(text) {input.value = text; input.dispatchEvent(new win.Event('input', {bubbles: true}));},
    auth(next) {user = next; win.dispatchEvent(new win.Event('lumina-auth-state'));}};
}
test('room drafts survive navigation, remain isolated, and never enter persistent storage', () => {
  const f = draftFixture();
  f.api.open('RoomA'); f.type('Szkic A <img src=x>');
  f.api.open('RoomB'); assert.equal(f.input.value, ''); f.type('Szkic B');
  f.api.open('RoomA'); assert.equal(f.input.value, 'Szkic A <img src=x>');
  f.api.leave(); assert.equal(f.input.value, '');
  f.api.open('RoomB'); assert.equal(f.input.value, 'Szkic B');
  assert.equal(f.win.localStorage.length, 0); assert.equal(f.win.sessionStorage.length, 0);
});
test('drafts clear on logout/account change, not on same-account profile refresh', () => {
  const f = draftFixture(); f.api.open('RoomA'); f.type('Only A');
  f.auth({uid: 'SyntheticOwnerA'}); assert.equal(f.input.value, 'Only A');
  f.auth(null); assert.equal(f.input.value, '');
  f.auth({uid: 'SyntheticOwnerB'}); f.api.open('RoomA'); assert.equal(f.input.value, '');
  f.type('Only B'); f.auth({uid: 'SyntheticOwnerA'}); f.api.open('RoomA'); assert.equal(f.input.value, '');
});
test('confirmed send clears only its unchanged draft and cannot clear a later session', () => {
  const f = draftFixture(); f.api.open('A'); f.type('Sent A');
  const ticket = f.api.capture('A', f.input.value);
  f.api.open('B'); f.type('Keep B'); f.api.confirmed(ticket);
  f.api.open('A'); assert.equal(f.input.value, '');
  f.type('New A'); f.api.confirmed(ticket); f.api.open('B'); f.api.open('A'); assert.equal(f.input.value, 'New A');
  const oldTicket = f.api.capture('A', f.input.value);
  f.auth(null); f.auth({uid: 'SyntheticOwnerA'}); f.api.open('A'); f.type('New A');
  f.api.confirmed(oldTicket); f.api.open('B'); f.api.open('A'); assert.equal(f.input.value, 'New A');
});
test('anonymous visitors cannot retain account drafts', () => {
  const f = draftFixture(); f.auth({uid: 'Anonymous', isAnonymous: true});
  f.api.open('A'); f.type('Guest'); f.api.open('B'); f.api.open('A'); assert.equal(f.input.value, '');
});
test('explicit logout clears drafts even while the SDK is unavailable', () => {
  const f = draftFixture(); f.api.open('A'); f.type('Private fixture');
  f.win.LuminaDB = undefined;
  f.win.dispatchEvent(new f.win.CustomEvent('lumina-auth-state', {detail: {user: null}}));
  assert.equal(f.input.value, '');
  f.auth({uid: 'SyntheticOwnerA'}); f.win.LuminaDB = {getCurrentUser: () => ({uid: 'SyntheticOwnerA'})};
  f.api.open('A'); assert.equal(f.input.value, '');
});
for (const file of surfaces) {
  const source=await readFile(file,'utf8');
  const start=source.indexOf('        async function handleSendActiveChatMessage(e) {');
  const end=source.indexOf('\n        //',start);
  assert.ok(start>=0 && end>start);
  const handler=source.slice(start,end).trim();
  test(file + ': draft integration loads the shared helper and scopes room switches', () => {
    assert.match(source, /lumi-chat-drafts\.js\?v=20261014_drafts1/);
    assert.match(source, /LumiChatDrafts\?\.open\(chatId\)/);
    assert.match(source, /LumiChatDrafts\?\.leave\(\)/);
    assert.match(handler, /LumiChatDrafts\?\.capture\(session.chatId, draft\)/);
    assert.match(handler, /if \(saved\) \{\s*window.LumiChatDrafts\?\.confirmed\(draftTicket\)/);
  });
  function fixture(send=async()=>null) {
    const win=new Window();
    win.document.body.innerHTML='<input id="activeChatInput"><button id="btnActiveChatSubmit"></button>';
    const input=win.document.querySelector('input'),button=win.document.querySelector('button');
    input.value='  Testowy szkic  ';
    const calls=[],notices=[];
    win.LuminaDB={getCurrentUser:()=>({uid:'SyntheticOwnerA'}),sendDirectMessageToCloud:async(...args)=>{calls.push(args);return send(...args);}};
    vm.runInContext(draftsSource,vm.createContext({window:win,document:win.document,Event:win.Event}));
    win.LumiChatDrafts.open('synthetic-room');
    input.value='  Testowy szkic  ';
    const context=vm.createContext({window:win,document:win.document,activeChatSession:{chatId:'synthetic-room',targetId:'synthetic-recipient'},showToast:(...args)=>notices.push(args),scrollChatToBottom:()=>{},handleActiveChatInputChange:text=>{button.disabled=!text.trim();}});
    const run=vm.runInContext('('+handler+')',context);
    return {win,input,button,calls,notices,context,run};
  }
  test(file+': failed, unavailable and unaccepted sends preserve draft and unlock retry',async()=>{
    for(const result of [null,'local_123',{status:'request_pending'},{status:'request_closed'},{}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.equal(f.input.hasAttribute('aria-busy'),false); assert.equal(f.notices.length,1);
    }
    for(const unavailable of [false,true]) {
      const f=fixture(async()=>{throw Error('synthetic network failure');});
      if(unavailable) f.win.LuminaDB=undefined;
      await f.run(); assert.equal(f.input.value,'  Testowy szkic  ');
      assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,false);
      assert.match(f.notices[0][0],/Tekst zachowano/);
    }
  });
  test(file+': only confirmed save or new request clears draft',async()=>{
    for(const result of ['synthetic-message-id',{status:'request_sent'}]) {
      const f=fixture(async()=>result); await f.run();
      assert.equal(f.input.value,''); assert.equal(f.input.disabled,false); assert.equal(f.button.disabled,true);
      assert.equal(f.calls[0][0],'synthetic-room'); assert.equal(f.calls[0][1].text,'Testowy szkic');
    }
  });
  test(file+': pending send cannot duplicate or erase another conversation draft',async()=>{
    let resolve;
    const f=fixture(()=>new Promise(done=>{resolve=done;}));
    const sending=f.run();
    assert.equal(f.input.value,'  Testowy szkic  '); assert.equal(f.input.disabled,true);
    await f.run(); assert.equal(f.calls.length,1);
    f.context.activeChatSession={chatId:'other-synthetic-room',targetId:'other-recipient'};
    f.win.LumiChatDrafts.open('other-synthetic-room');
    f.input.value='Nowa rozmowa';
    resolve('synthetic-message-id'); await sending;
    assert.equal(f.input.value,'Nowa rozmowa'); assert.equal(f.input.disabled,false);
  });
}

// Execute the complete shared chat component against an isolated DOM (no network).
const globalChatSource=await readFile('components/cc-global-chat-button.js','utf8');
function globalChatFixture(loggedIn=false){
 const win=new Window({url:'https://example.invalid/mess',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true}});
 const errors=[];win.addEventListener('error',e=>{errors.push(e.error);e.preventDefault();});
 win.LuminaDB={getCurrentUser:()=>loggedIn?{uid:'fixture-user'}:null,getCurrentProfile:()=>({slug:'fixture-user',name:'Fixture'}),
  getChatId:(a,b)=>[a,b].sort().join('_'),
  subscribeToDirectMessages:(_id,cb)=>{cb([{text:'Fixture cloud message',senderName:'Fixture peer'}]);return ()=>{};}};
 const ctx=vm.createContext({window:win,document:win.document,localStorage:win.localStorage,console,setTimeout:()=>0,clearTimeout:()=>{}});
 vm.runInContext(globalChatSource,ctx);
 win.document.dispatchEvent(new win.Event('DOMContentLoaded'));
 return {win,errors};
}
test('global chat actually opens and closes for a guest without runtime errors',()=>{
 const {win,errors}=globalChatFixture();
 win.document.getElementById('ccChatFabBtn').click();
 const overlay=win.document.getElementById('ccGlobalChatOverlay');
 assert.equal(overlay.getAttribute('aria-hidden'),'false');
 assert.ok(overlay.classList.contains('is-open'));
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/Czat Ogólny/);
 win.document.getElementById('ccChatCloseBtn').click();
 assert.equal(overlay.getAttribute('aria-hidden'),'true');assert.deepEqual(errors,[]);
});
test('global chat can select a private recipient as a guest without fabricated replies',()=>{
 const {win,errors}=globalChatFixture();win.document.getElementById('ccChatFabBtn').click();
 win.document.querySelector('[data-partner-id="wiolettarogowska"]').click();
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/wymagają zalogowanego/);
 assert.equal(win.document.querySelectorAll('.cc-chat-msg-row').length,0);assert.deepEqual(errors,[]);
});
test('global chat renders a confirmed private snapshot for a synthetic signed-in session',()=>{
 const {win,errors}=globalChatFixture(true);win.document.getElementById('ccChatFabBtn').click();
 win.document.querySelector('[data-partner-id="wiolettarogowska"]').click();
 assert.match(win.document.getElementById('ccChatMessagesList').textContent,/Fixture cloud message/);
 assert.deepEqual(errors,[]);
});

test('guest chat entry stays visible in both LUMINA themes',()=>{
 for(const theme of ['dark','light']){
  const {win}=globalChatFixture();win.document.documentElement.setAttribute('data-lumina-theme',theme);
  win.document.body.classList.add('user-is-guest');
  assert.equal(win.getComputedStyle(win.document.getElementById('ccGlobalChatFab')).display,'flex');
 }
});
test('mobile phone moves the same link to the header and restores its desktop position',async()=>{
 const source=await readFile('js/cc-mobile-helpline.js','utf8');
 const win=new Window();win.document.body.innerHTML='<header><div id="quickActionsMenu"></div></header><div id="player"><a id="helplineFloat" href="tel:+48730958583">Call</a></div>';
 let changed;const media={matches:true,addEventListener:(_name,fn)=>{changed=fn;}};win.matchMedia=()=>media;
 vm.runInNewContext(source,{window:win,document:win.document});
 const link=win.document.getElementById('helplineFloat');
 assert.equal(link.parentElement.id,'quickActionsMenu');
 assert.equal(link.getAttribute('href'),'tel:+48730958583');
 media.matches=false;changed();assert.equal(link.parentElement.id,'player');
 media.matches=true;changed();assert.equal(link.parentElement.id,'quickActionsMenu');
 assert.equal(win.document.querySelectorAll('#helplineFloat').length,1);
 const index=await readFile('index.html','utf8');assert.match(index,/cc-mobile-helpline\.js\?v=20261013_mobile1/);
 assert.match(index,/#mainHeader #helplineFloat \{ min-width: 44px; min-height: 44px;/);
});

test('mobile home hides its brand and reserves clear space for chat beside audio controls',async()=>{
 const html=await readFile('index.html','utf8');
 assert.match(html,/#mainHeader \.brand-logo \{ display: none !important; \}/);
 assert.match(html,/#radioPlayerBar \.player-right \{[^}]*padding-right: 88px !important/);
 assert.match(html,/#radioPlayerBar \.volume-slider \{[^}]*min-width: 0;[^}]*width: auto !important;[^}]*flex: 1 1 auto;/);
});
test('LUMINA shared chat remains visible for signed-in members in both themes',()=>{
 for(const theme of ['dark','light']){
  const {win}=globalChatFixture(true);
  win.document.documentElement.setAttribute('data-lumina-theme',theme);
  assert.equal(win.getComputedStyle(win.document.getElementById('ccGlobalChatFab')).display,'flex');
 }
});
test('LUMINA controls use one compact lane with chat immediately above scroll-to-top',async()=>{
 const source=await readFile('js/cc-back-to-top.js','utf8');
 assert.match(source,/#backToTopBtn\[data-cc-back-to-top\]\{bottom:var\(--cc-lumina-action-base\)/);
 assert.match(source,/#ccGlobalChatFab\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 60px\)/);
 assert.match(source,/#luminaThemeSwitchBtn\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 120px\)/);
 assert.match(source,/#luminaMiniPlayerContainer\.minimized\{display:flex!important;bottom:calc\(var\(--cc-lumina-action-base\) \+ 180px\)/);
 assert.match(source,/if \(visible && !luminaActions && document\.elementsFromPoint\)/);
 assert.match(source,/function start\(\) \{ mount\(\); mountLuminaActions\(\);/);
});

test('LUMI Messenger branding and mobile app shell preserve existing chat controls',async()=>{
 const {win,errors}=globalChatFixture();
 assert.equal(win.document.getElementById('ccChatFabBtn').getAttribute('aria-label'),'Otwórz LUMI Messenger');
 assert.match(win.document.getElementById('ccChatHeaderTitle').textContent,/LUMI Messenger/);
 assert.match(win.document.getElementById('ccChatFabTooltip').textContent,/LumiMess/);
 win.document.getElementById('ccChatFabBtn').click();
 for(const id of ['ccChatCloseBtn','ccChatTabLiveBtn','ccChatTabMembersBtn','ccChatTabChannelsBtn','ccChatSendBtn'])assert.ok(win.document.getElementById(id),id);
 const source=await readFile('components/cc-global-chat-button.js','utf8');
 assert.doesNotMatch(source,/height: min\(600px, 88vh\)/);
 assert.match(source,/height: var\(--lumi-viewport-height, 100dvh\)/);
 const css=await readFile('css/lumina-chat-premium.css','utf8');
 assert.match(css,/html body #directMessagesModal\.open/);
 assert.match(css,/height: var\(--lumi-viewport-height, 100dvh\)/);
 for(const page of surfaces){const html=await readFile(page,'utf8');assert.match(html,/LUMI Messenger<\/h3>/);}
 assert.deepEqual(errors,[]);
});
