import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {topics,sources} from '../docs/cc-help-series/topics.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('generator restores both missing debt pilot entries and preserves unrelated search data on repeated builds',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cc-help-index-'));
 // This is an exclusively test-created directory, validated before recursive cleanup.
 assert(path.resolve(temp).startsWith(path.resolve(os.tmpdir())+path.sep+'cc-help-index-'));
 try{
  for(const file of ['scripts/build-cc-help-series.mjs','cc-pomoc/catalog.json','help.html','dlugi/index.html','en/debt-help/index.html']){const dst=path.join(temp,file);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,file),dst);}
  fs.cpSync(path.join(root,'docs/cc-help-series'),path.join(temp,'docs/cc-help-series'),{recursive:true});
  const other={title:'Other agent page',url:'https://polskieradio.cc/unrelated',category:'Other',type:'page'};
  fs.mkdirSync(path.join(temp,'szukaj'),{recursive:true});fs.mkdirSync(path.join(temp,'data'),{recursive:true});
  fs.writeFileSync(path.join(temp,'szukaj/catalog.json'),JSON.stringify({items:[other],contextGuides:{preserved:true},totalItems:1}));
  fs.writeFileSync(path.join(temp,'sitemap.xml'),'<urlset><url><loc>'+other.url+'</loc></url></urlset>');
  fs.writeFileSync(path.join(temp,'data/ecosystem-map.json'),JSON.stringify({nodes:[]}));
  const existingDir=path.join(temp,topics[0].route);fs.mkdirSync(existingDir,{recursive:true});
  const prelude='\n<!-- Existing integration -->\n<script defer src="/js/owned-extension.js"></script>\n';
  fs.writeFileSync(path.join(existingDir,'index.html'),'<html><head>'+prelude+'<meta charset="utf-8"></head><body></body></html>');
  for(let run=0;run<2;run++){
   execFileSync(process.execPath,[path.join(temp,'scripts/build-cc-help-series.mjs')],{cwd:temp,windowsHide:true});
   const a=JSON.parse(fs.readFileSync(path.join(temp,'szukaj/catalog.json')));
   assert.deepEqual(a,JSON.parse(fs.readFileSync(path.join(temp,'data/cc-search-index.json'))));
   assert.deepEqual(a.items.find(i=>i.url===other.url),other);assert.deepEqual(a.contextGuides,{preserved:true});
   for(const [slug,lang] of [['dlugi','pl'],['en/debt-help','en']]){const items=a.items.filter(i=>i.url==='https://polskieradio.cc/'+slug);assert.equal(items.length,1);assert.equal(items[0].lang,lang);assert.equal(items[0].access,'public');}
   assert.equal(a.items.length,topics.length*2+3);
   const rendered=fs.readFileSync(path.join(existingDir,'index.html'),'utf8');assert(rendered.includes(prelude));assert.equal(rendered.split('/js/owned-extension.js').length-1,1);
   if(run===0)fs.writeFileSync(path.join(temp,'sitemap.xml'),'<sitemapindex><sitemap><loc>https://polskieradio.cc/sitemaps/other.xml</loc></sitemap></sitemapindex>');
   else {const index=fs.readFileSync(path.join(temp,'sitemap.xml'),'utf8');assert(index.includes('/sitemaps/other.xml'));assert(index.includes('/sitemaps/cc-pomoc.xml'));const helpMap=fs.readFileSync(path.join(temp,'sitemaps/cc-pomoc.xml'),'utf8');for(const url of ['https://polskieradio.cc/dlugi','https://polskieradio.cc/en/debt-help',...topics.flatMap(t=>['https://polskieradio.cc/'+t.route,'https://polskieradio.cc/en/'+t.enRoute])])assert(helpMap.includes('<loc>'+url+'</loc>'));}
  }
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('ninety-nine approved series topics, one hundred ninety-eight unique routes, existing aliases preserved',()=>{
 assert.equal(topics.length,99);assert.deepEqual(new Set(topics.map(t=>t.id)),new Set(['legal','addiction','psychology','marriage','parenting','family','senior','depression','pastor','specialists','free-legal-aid','consumer-rights','household-budget','emotional-crisis','loneliness','grief','child-psychology','teenagers','school-difficulties','cyberbullying','child-behaviour','parenting-guide','anxiety','stress','burnout','self-worth','trauma','digital-balance','children-separation','children-faith','marriage-crisis','separation','infidelity','marriage-communication','family-conflict','domestic-violence','single-parenting','engagement','enforcement','debt-planning','personal-insolvency','collection-rights','loan-support','alcohol-support','drug-support','gambling-support','pornography-support','stop-smoking','family-addiction-support','addiction-treatment','health-support','dietitian-support','healthy-living','diabetes-support','pressure-support','heart-health','sleep-support','rehabilitation-support','physical-activity','spa-treatment','senior-loneliness','senior-care','disability-rights','family-carers','retirement-support','care-home-support','senior-volunteering','finding-work','unemployment-support','career-guidance','responsible-entrepreneurship','starting-a-business','workplace-bullying','personal-development','time-management','social-assistance','homelessness-support','poverty-support','housing-crisis','food-assistance','migrant-support','mediation-support','urgent-life-support','questions-about-god','prayer-support','faith-crisis','bible-study','gospel-guide','sabbath-guide','forgiveness-support','christian-daily-life','christian-mentoring','christian-organisations','christian-retreats','christian-media','church-and-community','volunteering-with-cc','volunteer-roles','specialist-application']));const routes=topics.flatMap(x=>[x.route,'en/'+x.enRoute]);assert.equal(new Set(routes).size,198);
 for(const r of ['rodzina','malzenstwo','wychowanie','pomoc','psychologia','dlugi','zdrowie','rozwoj-osobisty','modlitwa','ewangelia'])assert(!routes.includes(r));
 const redirects=read('_redirects');for(const r of ['/rodzina /edukacja 301','/malzenstwo /seks 301','/wychowanie /edukacja 301','/zdrowie /ziu 301','/rozwoj-osobisty /holos 200'])assert(redirects.includes(r));
});
for(const t of topics)for(const lang of ['pl','en'])test(`${t.id}/${lang}: static translated content, routes, safeguards and local assets`,()=>{
 const route=lang==='pl'?t.route:'en/'+t.enRoute;const h=read(route+'/index.html');
 assert.equal(h,read(route+'.html'));assert(h.includes(`<html lang="${lang}">`));assert.equal((h.match(/<h1\b/g)||[]).length,1);
 for(const s of [`hreflang="pl" href="https://polskieradio.cc/${t.route}"`,`hreflang="en" href="https://polskieradio.cc/en/${t.enRoute}"`,'tel:112','/wspieraj','id="zasady-pomocy"','<dialog','aria-modal','id="pierwszy-krok"'].filter(s=>s!=='aria-modal'))assert(h.includes(s),s);
 assert(!/<form|<input|<textarea|mailto:/i.test(h));assert(!h.includes('�'));assert(h.includes(lang==='pl'?'zaniechania':'omissions'));assert(h.includes(lang==='pl'?'Nie ogłaszamy jeszcze dyżurów':'No staffed sessions'));
 assert(h.includes(lang==='pl'?'wygenerowana przez AI':'AI-generated'));
 assert.equal((h.match(/id="ccTopBarFavBtn"/g)||[]).length,1);assert(h.indexOf('id="ccTopBarFavBtn"')>h.indexOf('<dialog'));
 for(const [,p] of t[lang].steps)assert(p.length>55);
 for(const [,p] of t[lang].guides)assert(p.length>110);
 for(const key of t.resources){assert(sources[key]);const href=((lang==='en'&&sources[key][3])||sources[key][0]).replaceAll('&','&amp;');assert(h.includes('href="'+href+'"'),href);}
 for(const m of h.matchAll(/(?:src|href)="(\/[^"?#]+)(?:[?#][^"]*)?"/g)){
 const p=m[1];const file=path.join(root,p);assert(fs.existsSync(file)||fs.existsSync(file+'.html'),`missing local target ${p}`);
 }
 const image=fs.statSync(path.join(root,'cc-pomoc/assets',t.id+'.webp'));assert(image.size>10000&&image.size<250000);
});
test('health pages contain crisis access; family pages protect from coercion',()=>{
 for(const t of topics.filter(t=>t.mentalSupport||['psychology','depression','addiction'].includes(t.id)))assert(read(t.route+'/index.html').includes('tel:800702222'));
 for(const id of ['marriage','family']){const t=topics.find(t=>t.id===id);assert(read(t.route+'/index.html').includes('mediacji'));assert(read(t.route+'/index.html').includes('tel:800120002'));}
});
test('child and parent topics provide the child helpline and never collect case histories',()=>{
 const relevant=topics.filter(t=>t.childSupport);assert.equal(relevant.length,10);
 for(const t of relevant)for(const file of [t.route,'en/'+t.enRoute]){const h=read(file+'/index.html');assert(h.includes('tel:800121212'));assert(h.includes('https://czat.brpd.gov.pl/'));assert(!/<input|<textarea|<form/i.test(h));}
});
test('relationship topics provide independent safety support; violence access precedes imagery without privacy promises',()=>{
 const relevant=topics.filter(t=>t.familySafety);assert.equal(relevant.length,8);
 for(const t of relevant)for(const route of [t.route,'en/'+t.enRoute]){const h=read(route+'/index.html');assert(h.includes('tel:800120002'));assert(!/<form|<input|<textarea/i.test(h));assert(h.includes('https://niebieskalinia.info/')||t.id==='single-parenting');}
 for(const route of ['przemoc-domowa','en/domestic-violence-support']){const h=read(route+'/index.html');assert(h.indexOf('<aside class="urgent-help wrap"')<h.indexOf('<section class="hero wrap"'));assert(h.includes('tel:112'));assert(h.includes('tel:800120002'));assert.equal((h.match(/id="urgent-title"/g)||[]).length,1);assert(/nie usuwa historii|does not erase browsing history/.test(h));}
});
test('urgent help precedes the hero on both crisis pages and telephone targets have touch sizing',()=>{
 for(const route of ['kryzys','en/emotional-crisis']){const h=read(route+'/index.html');assert(h.indexOf('<aside class="urgent-help wrap"')<h.indexOf('<section class="hero wrap"'));assert.equal((h.match(/id="urgent-title"/g)||[]).length,1);assert(h.includes('tel:112'));assert(h.includes('tel:800702222'));}
 const css=read('cc-pomoc/series.css');const block=css.split('}').find(r=>r.includes('.urgent-help a[href^="tel:"]'));assert(block);assert(block.includes('a[href="https://czat.brpd.gov.pl/"]'));const rule=block.split('{')[1];assert(rule.includes('min-height:44px'));assert(rule.includes('min-width:44px'));
});
test('search surfaces agree and every language route appears once in search and sitemap',()=>{
 assert.equal(read('szukaj/catalog.json'),read('data/cc-search-index.json'));const cat=JSON.parse(read('szukaj/catalog.json'));assert.equal(cat.totalItems,cat.items.length); const rootMap=read('sitemap.xml'); const helpMap=rootMap.includes('<sitemapindex')?(assert(rootMap.includes('<loc>https://polskieradio.cc/sitemaps/cc-pomoc.xml</loc>')),read('sitemaps/cc-pomoc.xml')):rootMap;
 for(const t of topics)for(const lang of ['pl','en']){const url='https://polskieradio.cc/'+(lang==='pl'?t.route:'en/'+t.enRoute);const found=cat.items.filter(x=>x.url===url);assert.equal(found.length,1);assert.equal(found[0].lang,lang);assert.equal(found[0].access,'public');assert(helpMap.includes('<loc>'+url+'</loc>'));}
});
test('drawer is native modal; no browser storage or submission code',()=>{
 const js=read('cc-pomoc/series.js');assert(js.includes('.showModal()'));assert(js.includes("addEventListener('close'"));assert(!/fetch\(|localStorage|sessionStorage|sendBeacon|XMLHttpRequest/.test(js));assert(read('cc-pomoc/series.css').includes('prefers-reduced-motion'));
});
test('budget links reuse the correct language worksheet in the same tab',()=>{
 for(const [file,url] of [['budzet-domowy/index.html','https://polskieradio.cc/dlugi#pierwszy-krok'],['en/household-budget/index.html','https://polskieradio.cc/en/debt-help#pierwszy-krok']]){
  const h=read(file);const anchor=h.match(new RegExp('<a href="'+url+'"([^>]*)>'));assert(anchor);assert(!anchor[1].includes('target='));assert(!h.includes('id="budget-form"'));
 }
});

test('addiction pages distinguish charged behavioural support, emergency access and medical withdrawal safety',()=>{
 for(const route of ['alkoholizm','narkomania'])for(const r of [route, 'en/'+(route==='alkoholizm'?'alcohol-support':'drug-use-support')]){const h=read(r+'/index.html');assert(h.indexOf('<aside class="urgent-help wrap"')<h.indexOf('<section class="hero wrap"'));assert(h.includes('tel:112'));assert(h.includes('tel:800199990'));}
 for(const route of ['hazard','uzaleznienie-od-pornografii']){const h=read(route+'/index.html');assert(h.includes('tel:801889880'));assert(h.includes('opłata według taryfy operatora'));assert(!h.includes('tel:800199990'));}
 for(const route of ['alkoholizm','en/alcohol-support']){const h=read(route+'/index.html');assert(/nagłe odstawienie może być niebezpieczne|Suddenly stopping alcohol can be dangerous/.test(h));assert(h.includes('https://www.nhs.uk/conditions/alcohol-use-disorder/'));}
 for(const t of topics.filter(t=>t.checkedDate==='28.10.2026')){assert(read(t.route+'/index.html').includes('Informacje sprawdzone 28.10.2026'));assert(read('en/'+t.enRoute+'/index.html').includes('Information checked on 28 October 2026'));}
});
