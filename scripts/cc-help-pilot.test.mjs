import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { Window } from 'happy-dom';

const read=file=>fs.readFileSync(file,'utf8');
const pl=read('dlugi/index.html'),en=read('en/debt-help/index.html');
test('public pilot has real language documents, correct canonicals, alternate URLs and no noindex',()=>{
 for(const [lang,html,url] of [['pl',pl,'https://polskieradio.cc/dlugi'],['en',en,'https://polskieradio.cc/en/debt-help']]){
  assert.match(html,new RegExp('<html lang="'+lang+'"'));
  assert.ok(html.includes('rel="canonical" href="'+url+'"'));
  assert.match(html,/hreflang="pl"/);assert.match(html,/hreflang="en"/);
  assert.doesNotMatch(html,/noindex|nofollow/);
  assert.match(html,/https:\/\/polskieradio.cc\/wspieraj/);
 }
 assert.match(en,/>Step out of debt\.<\/span>/);
 assert.match(en,/data-lang="en" aria-pressed="true"/);
 assert.doesNotMatch(en,/>Wyjść z długów\.<\/span>/);
});
test('without JavaScript every form control is disabled before any input can be entered or submitted',()=>{
 for(const html of [pl,en]){
  const window=new Window();window.document.write(html);
  for(const form of window.document.forms){
   const barrier=form.querySelector('fieldset[disabled][data-js-fields]');assert.ok(barrier);
   const submit=form.querySelector('button[type="submit"]');assert.ok(barrier.contains(submit));
   for(const input of form.querySelectorAll('input,textarea'))assert.ok(barrier.contains(input));
  }
  window.happyDOM.abort();
 }
 const app=read('dlugi/help-page.js');
 assert.ok(app.indexOf("budgetForm.addEventListener('submit'")<app.indexOf('fieldset.disabled=false'));
 assert.ok(app.indexOf("volunteerForm.addEventListener('submit'")<app.indexOf('fieldset.disabled=false'));
 assert.match(read('_headers'),/form-action 'none'/);
});
test('public copy remains explicit about recruitment, draft mail, and responsibility',()=>{
 assert.match(pl,/Formularz poniżej przygotowuje wyłącznie szkic e-maila/);
 assert.match(en,/only prepares an email draft/);
 assert.match(pl,/nie wyłącza odpowiedzialności Christian Culture za własne działania/);
 assert.match(en,/does not exclude Christian Culture’s responsibility/);
 assert.doesNotMatch(pl,/data-testid="verified|status.*online|privacyNoticeVersion/);
});
test('PL and EN pilot can be found by actual search engine queries',()=>{
 const catalog=JSON.parse(read('szukaj/catalog.json'));
 assert.deepEqual(catalog,JSON.parse(read('data/cc-search-index.json')));
 const context={window:{__ccSearchCatalog:catalog,location:{pathname:'/wyszukiwarka/'}},document:{readyState:'loading',addEventListener(){}},URL};
 vm.runInNewContext(read('components/cc-omni-search.js'),context);
 assert.ok(context.window.CCOmniSearch.performSearch('CC Pomoc').items.some(i=>(i.tags||[]).includes('CC Pomoc')),'broad help query returns a published help topic');
 for(const [query,url] of [['wyjść z długów','/dlugi'],['debt help','/en/debt-help']])assert.ok(context.window.CCOmniSearch.performSearch(query).items.some(i=>i.url.endsWith(url)),query);
});

test('preparing a volunteer draft reveals the email options without sending data',()=>{
 const source = read('dlugi/help-page.js');
 const registration = source.match(/volunteerForm\.addEventListener\('submit',[\s\S]+?(?=\n  document\.getElementById\('download-draft'\))/)?.[0];
 assert.ok(registration);
 for (const lang of ['pl','en']) {
  let handleSubmit;
  let linkUpdates=0;
  const scope={
   lang,
   draft:'',
   draftPanel:{hidden:true},
   volunteerForm:{
    addEventListener(type,handler){assert.equal(type,'submit');handleSubmit=handler;},
    reportValidity(){return true;}
   },
   readDraft(){return 'synthetic enquiry';},
   setLinks(){linkUpdates++;},
   fetch(){assert.fail('preparing a draft must not send an enquiry');}
  };
  vm.runInNewContext(registration,scope);
  let prevented=false;
  handleSubmit({preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(scope.draft,'synthetic enquiry');
  assert.equal(scope.draftPanel.hidden,false);
  assert.equal(linkUpdates,1);
 }
});
