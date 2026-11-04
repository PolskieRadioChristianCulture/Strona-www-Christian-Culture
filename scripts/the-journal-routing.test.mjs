import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {DAYS} from '../the-journal/data/days.js';
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
  assert.match(response.headers.get('Content-Security-Policy'),/'nonce-[a-f0-9]{32}'/);
  assert(!response.headers.get('Content-Security-Policy').includes('unsafe-inline'));
  assert.match(response.headers.get('Content-Security-Policy'),/https:\/\/\*\.google-analytics.com/);
  const body=await response.text();
  assert.match(body,/rel="canonical" href="https:\/\/polskieradio.cc\/the-journal"/);
  const nonce=body.match(/name="cc-csp-nonce" content="([a-f0-9]{32})"/)[1];
  assert(response.headers.get('Content-Security-Policy').includes(`style-src 'self' 'nonce-${nonce}'`));
});
test('HEAD serves headers; POST cannot collect journal data',async()=>{
  const response=await worker.fetch(new Request('https://polskieradio.cc/the-journal',{method:'HEAD'}),{ASSETS:{fetch:async request=>{assert.equal(request.method,'HEAD');return new Response(null);}}},{});
  assert.equal(response.status,200);
  assert.equal(await response.text(),'');
  assert.equal((await worker.fetch(new Request('https://polskieradio.cc/the-journal',{method:'POST'}),{},{})).status,405);
});
test('shared release standard preserves the reviewed landing byte for byte',()=>{
  assert.equal(applyPageStandard('the-journal/index.html',html),html);
  assert.doesNotMatch(html, /noindex|cc-omni-search|cc-favorites|firebase|googletagmanager/);
  assert.match(html,/\/js\/cc-newsletter\.js/);
  assert.match(html,/\/js\/cc-mobile-edge\.js/);
  assert.match(html,/\/js\/cc-back-to-top\.js/);
  for(const match of html.matchAll(/(?:src|href)="(\/the-journal\/[^"#]+)"/g))assert(fs.existsSync(new URL('..'+match[1],import.meta.url)),match[1]);
});
test('youth portal address remains unclaimed by the new campaign rules',()=>{
  const redirects=fs.readFileSync(new URL('../_redirects',import.meta.url),'utf8');
  assert(!redirects.split('\n').some(line=>line.startsWith('/nastolatki')));
});
test('the landing states book/app status and exposes working subscription and support entry points',()=>{
  assert.match(html,/Strona projektu THE JOURNAL · książka i aplikacja w przygotowaniu/);
  assert.match(html,/<a[^>]+href="\/wspieraj"[^>]+aria-label="wspieramTO/);
  assert.match(html,/id="journal-newsletter-open"/);
  assert.match(html,/Zapis dla osób 16\+/);
  assert(!html.includes('id="menu"'));
});
test('SEO and AI discovery identify the real prelaunch project, not a purchasable book',()=>{
  const schema=JSON.parse(html.match(/id="journal-schema">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@graph'].find(n=>n['@type']==='FAQPage').mainEntity.length,5);
  assert.equal(schema['@graph'].find(n=>n['@type']==='CreativeWork').creativeWorkStatus,'Wersja PDF dostępna; wydanie książkowe i aplikacja w przygotowaniu');
  assert(!schema['@graph'].some(n=>n.offers||n.aggregateRating));
  assert.match(html, /<h1[^>]*><span class="visually-hidden">THE JOURNAL — pamiętnik dla młodzieży na 90 dni/);
  for(const file of ['data/cc-search-index.json','szukaj/catalog.json']){
    const catalog=JSON.parse(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'));
    assert.equal(catalog.items.filter(i=>i.url==='https://polskieradio.cc/the-journal').length,1);
  }
  assert.match(fs.readFileSync(new URL('../sitemaps/pages.xml',import.meta.url),'utf8'),/<loc>https:\/\/polskieradio.cc\/the-journal<\/loc>/);
  assert.match(fs.readFileSync(new URL('../llms.txt',import.meta.url),'utf8'),/THE JOURNAL/);
});

test('published materials retain the supplied originals and all 90 complete days',()=>{
  for(const [file,hash] of Object.entries({
    'data/days-90.json':'321725293687b8228392631abac9aa29f1e0708f276c3ca19dd0f341b5435d3a',
    'downloads/KARTA_DZIENNA.pdf':'ca1d6a61b2651bd573c2359cfe29582a67f7bdf3841cbdd0b1ff60567ae8f6f2',
    'downloads/THE_JOURNAL_90_DNI.pdf':'06d0f71e95ed48268ba80017a7df821da4a521d022c025386f0e9fd5e161a951'
  }))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../the-journal/'+file,import.meta.url))).digest('hex'),hash,file);
  assert.deepEqual(DAYS,JSON.parse(fs.readFileSync(new URL('../the-journal/data/days-90.json',import.meta.url),'utf8')));
  assert.deepEqual(DAYS.map(d=>d.day),Array.from({length:90},(_,i)=>i+1));
  assert.equal(new Set(DAYS.map(d=>d.title)).size,90);
  for(const d of DAYS){for(const key of ['stage','title','intro','question','action','reference','source_notice','optional_faith'])assert(d[key]?.trim(),`${d.day}: ${key}`);assert.equal(d.evening_questions.length,3);}
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
