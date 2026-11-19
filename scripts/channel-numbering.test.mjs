import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import sharp from 'sharp';
import {Window} from 'happy-dom';
import {CHANNELS,channelForPath,renderChannelDirectory} from './cc-channel-numbering.mjs';
import {applyPageStandard} from './cc-page-standard.mjs';
import {isPublicFile} from './cc-release-files.mjs';

test('approved order has 17 broadcast and 20 CCN channels with unique contiguous numbers and valid assets',async()=>{
  assert.deepEqual(CHANNELS.map(c=>c.number),Array.from({length:37},(_,i)=>i+1));
  assert.equal(CHANNELS.filter(c=>c.kind==='broadcast').length,17);
  assert.equal(CHANNELS.filter(c=>c.kind==='ccn').length,20);
  assert.equal(new Set(CHANNELS.map(c=>c.url)).size,37);
  for(const c of CHANNELS){
    assert.equal(channelForPath(c.url),c);
    assert.ok(c.url.startsWith('/')&&!c.url.startsWith('//'));
    const paths=[c.url.slice(1),c.url.slice(1)+'.html',c.url.slice(1)+'/index.html'];
    assert.ok(paths.some(p=>fs.existsSync(p)),c.url);
    const metadata=await sharp(c.image.slice(1)).metadata();
    assert.equal(metadata.width,512);assert.equal(metadata.height,512);
    assert.ok(fs.statSync(c.image.slice(1)).size<100000,c.image);
  }
});

test('portrait scene variants retain their channel number, while articles are not mistaken for portal roots',()=>{
  assert.equal(channelForPath('/stream-scene-vertical.html').number,14);
  assert.equal(channelForPath('/dzj-vertical-live.html').number,14);
  assert.equal(channelForPath('/biblia-spiewana-vertical.html').number,12);
  assert.equal(channelForPath('/ccn-news/index.html').number,18);
  assert.equal(channelForPath('/news/example-article'),undefined);
});

// @007 2026-11-18: nowa /nadawaj (L0 17.11) buduje karty w JS; numery kanałów ma w mapie CC_NUM zgodnej z rejestrem.
test('catalogue /nadawaj shows the official number for every numbered broadcast scene',async()=>{
  const raw=fs.readFileSync('nadawaj.html','utf8');
  const html=applyPageStandard('nadawaj.html',raw);
  assert.equal(applyPageStandard('nadawaj.html',html),html);
  const map=JSON.parse(raw.match(/const CC_NUM=(\{[^;]+\});/)[1]);
  const files=[...raw.matchAll(/\{f:'([^']+\.html)'/g)].map(m=>m[1]);
  let numbered=0;
  for(const file of files){
    const ch=channelForPath(file);
    if(ch&&ch.kind==='broadcast'){numbered++;assert.equal(map[file.replace(/\.html$/,'')],ch.number,file);}
  }
  assert.ok(numbered>=15,'za mało numerowanych scen: '+numbered);
  assert.match(raw,/data-cc-channel-number=/);
});

test('all CCN portal roots get an accessible identity strip and mobile stylesheet; protected broadcast sources remain byte-identical',()=>{
  assert.ok(fs.existsSync('css/cc-ccn-mobile.css'));
  assert.ok(isPublicFile('css/cc-ccn-mobile.css'));
  for(const c of CHANNELS.filter(c=>c.kind==='ccn')){
    const file=c.url.slice(1)+'.html';
    const raw=fs.readFileSync(file,'utf8');
    const output=applyPageStandard(file,raw);
    assert.match(output,new RegExp(`Kanał ${c.number}`));
    assert.ok(output.includes(c.image));
    assert.ok(output.includes('/css/cc-ccn-mobile.css?v=20261119_ccnmob1'), `${file} must load shared CCN mobile stylesheet`);
    assert.ok(output.includes('/css/cc-channel-numbering.css?v=20261119_numbers3'), `${file} must load updated channel numbering stylesheet`);
    assert.equal(applyPageStandard(file,output),output);
  }
  for(const file of ['cctv24-worship.html','cctv24-worship-live.html','stream-scene.html','cctv24.html','snadaniowa-live.html','zapolske-live.html']){
    const raw=fs.existsSync(file)?fs.readFileSync(file,'utf8'):'<!doctype html><html><head></head><body>Chroniona scena</body></html>';
    assert.equal(applyPageStandard(file,raw),raw,file);
  }
});

test('directory lists all 37 real destinations once with no script or simulated LIVE status',async()=>{
  const win=new Window({settings:{disableJavaScriptEvaluation:true}});
  try{
    win.document.write(renderChannelDirectory());
    const links=[...win.document.querySelectorAll('.cc-channel-card')];
    assert.equal(links.length,37);assert.equal(new Set(links.map(a=>a.getAttribute('href'))).size,37);
    assert.equal(win.document.querySelectorAll('h1').length,1);
    assert.equal(win.document.querySelectorAll('script,iframe,audio,video').length,0);
    const lf=s=>s.replace(/\r\n/g,'\n'); // checkout Windows zamienia LF na CRLF
    assert.equal(lf(fs.readFileSync('kanaly/index.html','utf8')),lf(renderChannelDirectory()));
  }finally{await win.happyDOM.close()}
});
