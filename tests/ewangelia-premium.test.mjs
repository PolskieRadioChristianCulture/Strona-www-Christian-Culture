import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import vm from 'node:vm';
import { mountAccount } from '../Ewangelia/account.js';
import { createAudioVisualizer } from '../Ewangelia/visualizer.js';

const html = await readFile(new URL('../Ewangelia/index.html', import.meta.url), 'utf8');
function page() {
  const window = new Window({url:'https://polskieradio.cc/Ewangelia'});
  window.document.write(html);
  return window;
}
test('source and clean-route entry remain identical', async () => {
  assert.equal(html, await readFile(new URL('../Ewangelia.html', import.meta.url),'utf8'));
});
test('account rejects cached or anonymous identities, accepts only the current real user and own avatar', async () => {
  const w = page(), d = w.document;
  let real = null, callback;
  const session = {
    ensureDbReady: async()=>({}),
    getFirebaseAuthUser:()=>real,
    getCurrentUser:()=>({uid:'cached'}), getCurrentProfile:()=>({uid:'cached',avatar:'/wrong.jpg'}),
    onAuthChange: cb => { callback = cb; },
  };
  await mountAccount(d, async()=>session);
  assert.equal(d.getElementById('accountLogin').hidden,false);
  real = {uid:'real',displayName:'Test User',photoURL:'https://example.org/google.jpg'};
  callback(real,{uid:'other',avatar:'/wrong.jpg',name:'Wrong'});
  assert.equal(d.getElementById('accountAvatar').src,real.photoURL);
  assert.equal(d.getElementById('accountName').textContent,'Test');
  callback(real,{uid:'real',slug:'my-profile',avatar:'/own.jpg',name:'Own User'});
  assert.match(d.getElementById('accountAvatar').src,/\/own.jpg$/);
  assert.match(d.getElementById('accountProfile').href,/lumina-profile.html\?u=my-profile$/);
  real = null; callback(null,null);
  assert.equal(d.getElementById('accountMenu').hidden,true);
  assert.equal(d.getElementById('accountAvatar').hasAttribute('src'),false);
  real = {uid:'guest',isAnonymous:true}; callback(real,{});
  assert.equal(d.getElementById('accountLogin').hidden,false);
  await w.happyDOM.close();
});
test('Google button calls the canonical login and renders the returned session; malicious photo URLs are ignored', async()=>{
  const w=page(), d=w.document;
  let real=null, calls=0;
  const session={ensureDbReady:async()=>({}),onAuthChange:()=>{},getFirebaseAuthUser:()=>real,
    getCurrentUser:()=>real,getCurrentProfile:()=>({uid:'account',avatar:'javascript:alert(1)'}),
    loginWithGoogle:async()=>{calls++;real={uid:'account',displayName:'Member'};return {user:real};}};
  await mountAccount(d,async()=>session);
  d.getElementById('accountLogin').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(calls,1);
  assert.equal(d.getElementById('accountMenu').hidden,false);
  assert.equal(d.getElementById('accountAvatar').hidden,true);
  await w.happyDOM.close();
});
test('spectrum follows analyser samples, falls flat on silence/pause, reuses one audio graph and respects reduced motion', async()=>{
  const w=page(),d=w.document, audio=new w.EventTarget();
  Object.assign(audio,{paused:false,ended:false,muted:false,volume:1});
  let sample=255, graphs=0, queued, reduced=false, preferenceChange;
  const media={get matches(){return reduced;},addEventListener:(event,cb)=>{preferenceChange=cb;}};
  const env={matchMedia:()=>media,cancelAnimationFrame:()=>{queued=null;},requestAnimationFrame:cb=>{queued=cb;return 1;},
    AudioContext:class {state='running';destination={};createMediaElementSource(){graphs++;return {connect(){}};}
      createAnalyser(){return {frequencyBinCount:128,getByteFrequencyData:b=>b.fill(sample)};} }};
  const visualizer=createAudioVisualizer(audio,d.getElementById('wave'),env);
  await visualizer.prepare();await visualizer.prepare();assert.equal(graphs,1);
  audio.dispatchEvent(new w.Event('playing'));queued(100);
  assert.equal(d.querySelector('#wave i').style.transform,'scaleY(1)');
  sample=0;queued(200);assert.equal(d.querySelector('#wave i').style.transform,'scaleY(0.06)');
  sample=255;queued(300);audio.paused=true;audio.dispatchEvent(new w.Event('pause'));
  assert.equal(d.querySelector('#wave i').style.transform,'scaleY(0.06)');
  audio.paused=false;reduced=true;preferenceChange();audio.dispatchEvent(new w.Event('playing'));assert.equal(queued,null);
  visualizer.setEnabled(true);queued(400);assert.equal(d.querySelector('#wave i').style.transform,'scaleY(1)');
  await w.happyDOM.close();
});
test('cached duration, radio connection truth, cancellation and mute labels are driven by media state',async()=>{
  const w=page(),d=w.document, radio=d.getElementById('ccRadioAudio'),audio=d.getElementById('audio');
  Object.defineProperty(audio,'duration',{value:102.8});
  let accept, reject;
  radio.play=()=>new Promise((resolve,fail)=>{accept=resolve;reject=fail;});
  radio.pause=()=>{};radio.load=()=>{};
  const src=(await readFile(new URL('../Ewangelia/app.js',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'');
  vm.runInNewContext(src,{document:d,window:w,navigator:w.navigator,location:w.location,
    matchMedia:w.matchMedia.bind(w),setTimeout,clearTimeout,
    createAudioVisualizer:()=>({prepare:async()=>true,getEnabled:()=>false,setEnabled:()=>{}})});
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  assert.equal(d.getElementById('endTime').textContent,'1:42');
  const button=d.getElementById('radioCtaBtn');
  button.click();assert.equal(button.dataset.state,'loading');assert.equal(button.getAttribute('aria-pressed'),'false');
  radio.dispatchEvent(new w.Event('playing'));accept();
  assert.equal(button.dataset.state,'playing');assert.equal(button.getAttribute('aria-pressed'),'true');
  button.click();assert.equal(button.dataset.state,'idle');assert.equal(button.getAttribute('aria-pressed'),'false');
  button.click();reject(new Error('test offline'));await new Promise(resolve=>setImmediate(resolve));
  assert.equal(button.dataset.state,'error');assert.equal(button.getAttribute('aria-pressed'),'false');
  d.getElementById('mute').click();assert.equal(d.getElementById('mute').getAttribute('aria-label'),'Włącz dźwięk');
  await w.happyDOM.close();
});
test('radio uses the canonical measurement module once per page, never counts the recording',async()=>{
  const w=page(),d=w.document,src=await readFile(new URL('../js/cc-radio-milion.js',import.meta.url),'utf8');
  const counted=[];
  const context={window:{},document:d,location:{hostname:'polskieradio.cc',pathname:'/Ewangelia'},
    navigator:{sendBeacon:(url,body)=>{counted.push({url,body});return true;}},Blob,HTMLMediaElement:w.HTMLMediaElement};
  vm.runInNewContext(src,context);
  d.getElementById('audio').dispatchEvent(new w.Event('play'));assert.equal(counted.length,0);
  d.getElementById('ccRadioAudio').dispatchEvent(new w.Event('playing'));
  d.getElementById('ccRadioAudio').dispatchEvent(new w.Event('playing'));
  assert.equal(counted.length,1);assert.equal(counted[0].url,'/api/milion/count');
  assert.equal(await counted[0].body.text(),'{"type":"radio"}');
  await w.happyDOM.close();
});
