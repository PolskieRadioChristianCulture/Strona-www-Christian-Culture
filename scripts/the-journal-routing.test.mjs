import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import worker from '../_worker.js';
import {applyPageStandard} from './cc-page-standard.mjs';
const html=fs.readFileSync(new URL('../the-journal/index.html',import.meta.url),'utf8');
test('campaign aliases and alternate index forms preserve query parameters and converge in one redirect', async()=>{
  for(const route of ['/90dni','/90dni/','/moj-dzien','/moj-dzien/','/twoja-historia','/twoja-historia/','/the-journal/','/the-journal/index.html','/The-Journal']){
    const response=await worker.fetch(new Request(`https://polskieradio.cc${route}?utm_source=whatsapp`),{},{});
    assert.equal(response.status,301,route);
    assert.equal(response.headers.get('location'),'https://polskieradio.cc/the-journal?utm_source=whatsapp');
  }
});
test('canonical landing uses directory assets and applies an isolated content policy',async()=>{
  let fetched;
  const response=await worker.fetch(new Request('https://polskieradio.cc/the-journal'),{ASSETS:{fetch:async request=>{fetched=new URL(request.url).pathname;return new Response(html);}}},{});
  assert.equal(response.status,200);
  assert.equal(fetched,'/the-journal/');
  assert.match(response.headers.get('Content-Security-Policy'),/form-action 'none'/);
  assert.match(response.headers.get('Content-Security-Policy'),/https:\/\/\*\.google-analytics.com/);
  assert.match(await response.text(),/rel="canonical" href="https:\/\/polskieradio.cc\/the-journal"/);
});
test('HEAD serves headers; POST cannot collect journal data',async()=>{
  const response=await worker.fetch(new Request('https://polskieradio.cc/the-journal',{method:'HEAD'}),{ASSETS:{fetch:async request=>{assert.equal(request.method,'HEAD');return new Response(null);}}},{});
  assert.equal(response.status,200);
  assert.equal(await response.text(),'');
  assert.equal((await worker.fetch(new Request('https://polskieradio.cc/the-journal',{method:'POST'}),{},{})).status,405);
});
test('shared release standard preserves the reviewed landing byte for byte',()=>{
  assert.equal(applyPageStandard('the-journal/index.html',html),html);
  assert.doesNotMatch(html, /noindex|cc-newsletter|cc-omni-search|cc-favorites|firebase|googletagmanager/);
  for(const match of html.matchAll(/(?:src|href)="(\/the-journal\/[^"#]+)"/g))assert(fs.existsSync(new URL('..'+match[1],import.meta.url)),match[1]);
});
test('youth portal address remains unclaimed by the new campaign rules',()=>{
  const redirects=fs.readFileSync(new URL('../_redirects',import.meta.url),'utf8');
  assert(!redirects.split('\n').some(line=>line.startsWith('/nastolatki')));
});
test('SEO and AI discovery identify the real prelaunch project, not a purchasable book',()=>{
  const schema=JSON.parse(html.match(/id="journal-schema">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@graph'].find(n=>n['@type']==='FAQPage').mainEntity.length,5);
  assert.equal(schema['@graph'].find(n=>n['@type']==='CreativeWork').creativeWorkStatus,'W przygotowaniu');
  assert(!schema['@graph'].some(n=>n.offers||n.aggregateRating));
  assert.match(html, /<h1[^>]*><span class="visually-hidden">THE JOURNAL — pamiętnik dla młodzieży na 90 dni/);
  for(const file of ['data/cc-search-index.json','szukaj/catalog.json']){
    const catalog=JSON.parse(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
    assert.equal(catalog.items.filter(i=>i.url==='https://polskieradio.cc/the-journal').length,1);
  }
  assert.match(fs.readFileSync(new URL('../sitemaps/pages.xml',import.meta.url),'utf8'),/<loc>https:\/\/polskieradio.cc\/the-journal<\/loc>/);
  assert.match(fs.readFileSync(new URL('../llms.txt',import.meta.url),'utf8'),/THE JOURNAL/);
});
test('GA4 remains opt-in and sends canonical page metadata without choices or URL parameters',()=>{
  const listeners={},store={},scripts=[];
  const status={textContent:''};
  const context={URLSearchParams,Date,location:{search:'?cc_team=1&private=test'},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v;}},document:{getElementById:id=>id==='analytics-status'?status:{addEventListener:(event,fn)=>{listeners[id]=fn;}},createElement:()=>({}),head:{append:s=>scripts.push(s)}},window:{}};
  vm.runInNewContext(fs.readFileSync(new URL('../the-journal/analytics.js',import.meta.url),'utf8'),context);
  context.gtag=context.window.gtag;
  assert.equal(scripts.length,0);
  assert.equal(context.window['ga-disable-G-Y4EFTVBPE3'],true);
  // Browser window properties become global bindings; mirror that behavior in vm.
  Object.defineProperty(context,'gtag',{get:()=>context.window.gtag,configurable:true});
  listeners['analytics-allow']();
  assert.equal(scripts.length,1);
  const commands=JSON.parse(JSON.stringify(context.window.dataLayer.map(a=>[...a])));
  const page=commands.find(c=>c[0]==='event'&&c[1]==='page_view');
  assert.equal(page[2].page_location,'https://polskieradio.cc/the-journal');
  assert.equal(page[2].traffic_type,'internal');
  assert(!JSON.stringify(commands).includes('private=test'));
  listeners['analytics-deny']();
  assert.equal(context.window['ga-disable-G-Y4EFTVBPE3'],true);
});
