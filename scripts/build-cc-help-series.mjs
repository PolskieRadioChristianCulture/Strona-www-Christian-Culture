import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {topics,sources} from '../docs/cc-help-series/topics.mjs';
import {applyCatalog} from '../docs/cc-help-series/catalog-render.mjs';
import {renderHelpHub} from '../docs/cc-help-series/hub-render.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const origin='https://polskieradio.cc';
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const tx=(en,a,b)=>en?b:a;
const dateFormat=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const route=(t,en)=>en?`en/${t.enRoute}`:t.route;
const assets='/cc-pomoc/assets/';
function resourceCard(key,en){
 const s=sources[key];const href=(en&&s[3])||s[0];
 const target=href.startsWith(origin+'/')?'':' target="_blank" rel="noopener noreferrer"';
 return `<a href="${esc(href)}"${target}><div><h3>${esc(s[en?2:1])}</h3><p>${tx(en,'Zobacz informacje, zakres materiału lub wsparcia i warunki korzystania.','Read the information, scope of the resource or support, and terms of use.')}</p></div><span aria-hidden="true">↗</span></a>`;
}
function prioritiseUrgentHelp(html,topic){
 if(!topic.crisisFirst)return html;
 const hero=html.indexOf('<section class="hero wrap"');
 const start=html.indexOf('<aside class="urgent-help wrap"');
 const end=html.indexOf('</aside>',start)+8;
 if(hero<0||start<hero||end<start)throw Error('Missing urgent-help block for '+topic.id);
 return html.slice(0,hero)+html.slice(start,end)+'\n'+html.slice(hero,start)+html.slice(end);
}
function urgentSupportLines(topic,en){
 let html='';
 if(topic.addictionSupport)html+=`<p>${tx(en,'Telefon Uzależnienia w Polsce:','Addiction helpline in Poland:')} <a href="tel:800199990">800 199 990</a> — ${tx(en,'bezpłatnie, codziennie 16:00–21:00.','free, daily 16:00–21:00 Poland time. Ask about language availability.')}</p>`;
 if(topic.behaviouralSupport)html+=`<p>${tx(en,'Uzależnienia behawioralne:','Behavioural addiction helpline in Poland:')} <a href="tel:801889880">801 889 880</a> — ${tx(en,'codziennie 17:00–22:00; opłata według taryfy operatora.','daily 17:00–22:00 Poland time; charged at your operator’s rate. Ask about language availability.')}</p>`;
 if(topic.mentalSupport||['psychology','depression','addiction'].includes(topic.id))html+=`<p>${tx(en,'Dorośli w kryzysie psychicznym w Polsce:','Adults in a mental health crisis in Poland:')} <a href="tel:800702222">800 70 22 22</a> — ${tx(en,'bezpłatnie, całą dobę.','free, around the clock. Ask about language availability.')}</p>`;
 if(topic.childSupport)html+=`<p>${tx(en,'Dzieci i młodzież w Polsce:','Children and young people in Poland:')} <a href="tel:800121212">800 12 12 12</a> — ${tx(en,'bezpłatnie, całą dobę.','free, around the clock. Ask about language availability.')} <a href="https://czat.brpd.gov.pl/" target="_blank" rel="noopener noreferrer">${tx(en,'Czat RPD','RPD support chat')}</a>.</p>`;
 if(topic.familySafety||['marriage','family','parenting','senior'].includes(topic.id))html+=`<p>${tx(en,'Przemoc domowa — Niebieska Linia:','Domestic violence — Niebieska Linia in Poland:')} <a href="tel:800120002">800 120 002</a> — ${tx(en,'bezpłatnie, całą dobę.','free, around the clock. Ask about language availability.')}</p>`;
 return html;
}
function render(t,en){
 const l=en?'en':'pl',c=t[l],url=`${origin}/${route(t,en)}`;
 const nav=topics.map(x=>`<a ${x===t?'aria-current="page"':''} href="/${route(x,en)}">${esc(x[l].name)}</a>`).join('');
 const responsibility=tx(en,'Christian Culture ułatwia kontakt z niezależnymi specjalistami i osobami udzielającymi wsparcia. Za treść własnych porad i sposób świadczenia pomocy odpowiada osoba, która jej udziela. Udział w rozmowie nie gwarantuje określonego rezultatu.','Christian Culture facilitates contact with independent professionals and support providers. Each provider is responsible for their own advice and service. Taking part in a conversation does not guarantee any particular outcome.');
 return `<!doctype html>
<html lang="${l}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="referrer" content="strict-origin-when-cross-origin"><title>${esc(c.name)} — CC ${en?'Help':'Pomoc'} | Christian Culture</title><meta name="description" content="${esc(c.lead)}"><link rel="icon" href="/dlugi/assets/cc-logo.webp"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="pl" href="${origin}/${t.route}"><link rel="alternate" hreflang="en" href="${origin}/en/${t.enRoute}"><link rel="alternate" hreflang="x-default" href="${origin}/${t.route}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(c.name)} — Christian Culture"><meta property="og:description" content="${esc(c.lead)}"><meta property="og:url" content="${url}"><meta property="og:locale" content="${en?'en_GB':'pl_PL'}"><meta property="og:image" content="${origin}${assets}${t.id}.webp"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/dlugi/styles.css?v=20261027b"><link rel="stylesheet" href="/cc-pomoc/series.css?v=20261027_support3"><script src="/cc-pomoc/series.js?v=20261027" defer></script></head>
<body><a class="skip" href="#main">${tx(en,'Przejdź do treści','Skip to content')}</a>
<header class="header"><div class="header-inner wrap"><a class="brand" href="/"><img src="/dlugi/assets/cc-logo.webp" width="66" height="68" alt="Christian Culture Mission"><span>CHRISTIAN CULTURE<small>${tx(en,'WIARA · WSPARCIE · NADZIEJA','FAITH · SUPPORT · HOPE')}</small></span></a><nav class="desktop-nav" aria-label="${tx(en,'Nawigacja strony','Page navigation')}"><a href="#pierwszy-krok">${tx(en,'Pierwszy krok','First steps')}</a><a href="#pomoc">${tx(en,'Źródła pomocy','Find help')}</a></nav><div class="header-actions"><a class="support" href="${origin}/wspieraj">${tx(en,'Wspieram to','Support this')}</a><div class="language"><a href="/${t.route}" lang="pl" hreflang="pl" ${!en?'aria-current="page"':''}>PL</a><a href="/en/${t.enRoute}" lang="en" hreflang="en" ${en?'aria-current="page"':''}>EN</a></div><button class="menu-toggle" id="open-menu" type="button" aria-controls="edge-panel" aria-expanded="false" aria-label="${tx(en,'Otwórz panel tematów','Open topics panel')}">+</button></div></div></header>
<main id="main"><p class="pilot-note wrap">${tx(en,'CC Pomoc: nabór specjalistów trwa. Nie ogłaszamy jeszcze dyżurów. To strona informacyjna, nie gabinet ani punkt interwencji.','CC Help: recruitment is open. No staffed sessions are announced. This is an information page, not a clinic or emergency service.')}</p>
<section class="hero wrap" aria-labelledby="hero-title"><div class="hero-copy"><p class="section-label">CC ${en?'HELP':'POMOC'} · ${esc(c.name.toLocaleUpperCase(l))}</p><h1 id="hero-title">${esc(c.title)}</h1><p class="lead">${esc(c.lead)}</p><div class="actions"><a class="button primary" href="#pierwszy-krok">${tx(en,'Zacznij od pierwszego kroku','Start with one step')} ↗</a><a class="text-link" href="#pomoc">${tx(en,'Gdzie szukać pomocy','Where to find help')} →</a></div><p class="hero-note">${tx(en,'Z szacunkiem do Twojej sytuacji. Bez oceniania i bez obietnic szybkich rozwiązań.','Respect for your situation. No judgement and no promises of instant solutions.')}</p></div><figure class="hero-picture"><img src="${assets}${t.id}.webp" width="1200" height="800" alt="${esc(c.alt)}" fetchpriority="high"><figcaption>${tx(en,'Ilustracja wygenerowana przez AI; nie przedstawia placówki CC.','AI-generated illustration; not a CC facility.')}</figcaption></figure></section>
<aside class="urgent-help wrap" aria-labelledby="urgent-title"><h2 id="urgent-title">${tx(en,'Jeśli potrzebujesz pomocy teraz','If you need help now')}</h2><p>${tx(en,'Przy bezpośrednim zagrożeniu życia lub zdrowia dzwoń pod','For an immediate threat to life or health call')} <span class="urgent-call"><a href="tel:112">112</a>.</span> ${tx(en,'Nie czekaj na odpowiedź Christian Culture.','Do not wait for Christian Culture to reply.')}</p>${urgentSupportLines(t,en)}<a class="text-link" href="#pomoc">${tx(en,'Źródła i warunki pomocy poniżej','Sources and service details below')} ↓</a></aside>
<section class="section wrap" id="pierwszy-krok" aria-labelledby="steps-title"><div class="section-heading"><h2 id="steps-title">${tx(en,'Trzy pierwsze kroki','Three first steps')}</h2><p>${tx(en,'Nie musisz rozwiązać wszystkiego dzisiaj. Wybierz jeden możliwy krok.','You do not have to solve everything today. Choose one manageable step.')}</p></div><ol class="first-steps">${c.steps.map(([title,body],i)=>`<li><span class="step-number" aria-hidden="true">0${i+1}</span><h3>${esc(title)}</h3><p>${esc(body)}</p></li>`).join('')}</ol></section>
<section class="guidance"><div class="wrap section"><p class="section-label">${tx(en,'PRZYGOTUJ SIĘ DO ROZMOWY','PREPARE FOR A CONVERSATION')}</p><div class="guide-columns">${c.guides.map(([title,body])=>`<article><h2>${esc(title)}</h2><p>${esc(body)}</p></article>`).join('')}</div></div></section>
<section class="section wrap" id="pomoc" aria-labelledby="resources-title"><div class="section-heading"><h2 id="resources-title">${tx(en,'Sprawdzone źródła. Realne miejsca pomocy.','Official sources. Real routes to help.')}</h2><p>${tx(en,'Materiały CC i oficjalne źródła pomocy w Polsce. Link do instytucji zewnętrznej nie oznacza partnerstwa.','CC resources and official help sources in Poland. Linking to an external institution does not imply a partnership.')}</p></div><div class="resource-list">${t.resources.map(key=>resourceCard(key,en)).join('')}</div><p class="small">${tx(en,'Informacje sprawdzone '+(t.checkedDate||'27.10.2026')+'. Dostępność, uprawnienia i koszty sprawdź bezpośrednio u organizatora. CC nie ustala terminów tych usług.','Information checked on '+dateFormat.format(new Date((t.checkedDate||'27.10.2026').split('.').reverse().join('-')+'T00:00:00Z'))+'. Confirm availability, eligibility and fees directly with each provider. CC does not arrange their appointments. English-language assistance is not guaranteed.')}</p></section>
<aside class="responsibility wrap" id="zasady-pomocy"><h2>${tx(en,'Ważne: rola Christian Culture','Important: Christian Culture’s role')}</h2><p>${responsibility}</p><details><summary>${tx(en,'Pełna informacja o odpowiedzialności','Full responsibility notice')}</summary><p>${tx(en,'Treści mają charakter ogólny i edukacyjny; nie stanowią indywidualnej porady prawnej, diagnozy ani terapii. Przed skorzystaniem z usługi sprawdź kwalifikacje, zakres, zasady poufności i warunki osoby lub instytucji, która jej udziela. Własne decyzje podejmuj z uwzględnieniem swojej sytuacji oraz odpowiedniej pomocy specjalistycznej. Powyższa informacja nie wyłącza odpowiedzialności Christian Culture za własne działania lub zaniechania ani praw, których nie można wyłączyć na mocy obowiązujących przepisów.','The content is general and educational, not individual legal advice, diagnosis or therapy. Before using a service, check the provider’s qualifications, scope, confidentiality arrangements and terms. Make decisions in light of your circumstances and appropriate professional advice. This notice does not exclude Christian Culture’s responsibility for its own acts or omissions, or any rights that applicable law does not allow to be excluded.')}</p></details></aside>
<section class="hope"><div class="wrap"><p class="section-label">${tx(en,'WIARA I TROSKA O CZŁOWIEKA','FAITH AND CARE FOR PEOPLE')} · ${esc(en ? (t.refEn || t.ref) : t.ref)}</p><h2>${tx(en,'Nadzieja nie wyklucza szukania pomocy.','Hope and seeking help belong together.')}</h2><p>${esc(c.hope)}</p><a class="text-link" href="/mojabiblia">${tx(en,'Otwórz Biblię','Open the Bible')} ↗</a></div></section>
<section class="section wrap"><div class="recruitment"><p class="category">${tx(en,'INICJATYWA W BUDOWIE','AN INITIATIVE IN DEVELOPMENT')}</p><h2>${tx(en,'Pomagasz zawodowo? Dołącz do tworzenia CC Pomoc.','Are you a qualified provider? Help build CC Help.')}</h2><p>${tx(en,'Nabór trwa. Nie publikujemy fikcyjnych profili ani terminów konsultacji. Zgłoszenie nie oznacza przyjęcia do zespołu; zakres współpracy wymaga uzgodnienia.','Recruitment is open. We publish no fictional profiles or appointment slots. An application does not mean acceptance; the scope of cooperation must be agreed.')}</p><a class="button outline" href="${en?'/en/debt-help':'/dlugi'}#wolontariat">${tx(en,'Przygotuj zgłoszenie — szkic e-maila','Prepare an application — email draft')} ↗</a><p class="small">${tx(en,'Wspólny formularz przygotowuje szkic. Samo wypełnienie niczego nie wysyła. Nie dołączaj dokumentacji medycznej ani historii osób korzystających z pomocy.','The shared form prepares a draft. Completing it sends nothing. Do not include medical records or service users’ case histories.')}</p></div></section>
<section class="faq section wrap"><h2>${tx(en,'Warto wiedzieć','Good to know')}</h2>${c.faq.map(([q,a])=>`<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</section>
<section class="related wrap section"><h2>${tx(en,'Pozostałe tematy wsparcia','Other support topics')}</h2><nav aria-label="${tx(en,'Tematy CC Pomoc','CC Help topics')}">${nav}<a href="${en?'/en/debt-help':'/dlugi'}">${tx(en,'Wyjść z długów','Debt help')}</a></nav></section>
<section class="support-section"><div class="wrap support-inner"><div><h2>${tx(en,'Pomóż rozwijać dobre wsparcie.','Help good support grow.')}</h2><p>${tx(en,'Wspieraj rozwój misji Christian Culture. Wsparcie finansowe nie jest warunkiem korzystania z tych informacji.','Support the Christian Culture mission. Donations are not a condition of using this information.')}</p></div><a class="button outline" href="${origin}/wspieraj">${tx(en,'Wspieram to','Support this')} ↗</a></div></section></main>
<footer class="footer wrap"><div class="footer-inner"><a class="brand" href="/">Christian Culture</a><a href="/wyszukiwarka/">${tx(en,'Wyszukiwarka EkoCC','Search EkoCC')}</a><a href="#zasady-pomocy">${tx(en,'Zasady pomocy','Responsibility notice')}</a><p>${tx(en,'Informacje ogólne. Bez zbierania opisów Twojej sytuacji na tej stronie.','General information. This page does not collect your personal situation.')}</p></div></footer>
<dialog class="edge-panel" id="edge-panel" aria-labelledby="panel-title"><div class="panel-heading"><h2 id="panel-title">CC ${en?'Help':'Pomoc'}</h2><button class="icon-button" id="close-menu" aria-label="${tx(en,'Zamknij panel','Close panel')}">×</button></div><nav>${nav}<a href="${en?'/en/debt-help':'/dlugi'}">${tx(en,'Wyjść z długów','Debt help')}</a><a href="/wyszukiwarka/">${tx(en,'Wyszukiwarka','Search')}</a></nav><a class="support" href="${origin}/wspieraj">${tx(en,'Wspieram to','Support this')}</a></dialog>
</body></html>\n`;
}
for(const t of topics)for(const en of [false,true]){
 const dir=route(t,en);await mkdir(path.join(root,dir),{recursive:true});
 let html=applyCatalog(prioritiseUrgentHelp(render(t,en),t),en?'en':'pl',dir);
 // Preserve head extensions already introduced by other agents on this existing page.
 // Do not introduce those integrations on newly created routes.
 try {
  const existing=await readFile(path.join(root,dir,'index.html'),'utf8');
  const prelude=existing.match(/<head>([\s\S]*?)(?=<meta\s+charset=)/i)?.[1]||'';
  if(prelude.trim()) html=html.replace('<head>','<head>'+prelude);
 } catch(error) {if(error.code!=='ENOENT')throw error;}
 await writeFile(path.join(root,dir,'index.html'),html);await writeFile(path.join(root,dir+'.html'),html);
}
// Patch only navigation in the current debt pilot; never rerun the obsolete pilot renderer.
for(const [dir,lang] of [['dlugi','pl'],['en/debt-help','en']]){
 const file=path.join(root,dir,'index.html');const html=applyCatalog(await readFile(file,'utf8'),lang,dir);
 await writeFile(file,html);await writeFile(path.join(root,dir+'.html'),html);
}
// Both search surfaces must describe exactly the same pages.
const catalog=JSON.parse(await readFile(path.join(root,'szukaj/catalog.json'),'utf8'));
const urls=new Set(topics.flatMap(t=>[origin+'/'+t.route,origin+'/en/'+t.enRoute]));
catalog.items=catalog.items.filter(x=>!urls.has(x.url));
for(const t of topics)for(const en of [false,true])catalog.items.push({title:`${t[en?'en':'pl'].name} — CC ${en?'Help':'Pomoc'}`,category:en?'Help and support':'Pomoc i wsparcie',url:origin+'/'+route(t,en),description:t[en?'en':'pl'].lead,tags:[t[en?'en':'pl'].name,t.route,'CC Pomoc','CC Help',en?'support':'wsparcie'],type:'page',access:'public',lang:en?'en':'pl'});
// Upstream index rebuilds can omit the separate debt pilot. Restore it from its
// current public documents; never roll the pilot page back to an old renderer.
for(const [pilot,lang] of [['dlugi','pl'],['en/debt-help','en']]){
 const url=origin+'/'+pilot;
 if(catalog.items.some(item=>item.url===url))continue;
 const html=await readFile(path.join(root,pilot,'index.html'),'utf8');
 const title=html.match(/<title>([^<]+)<\/title>/)?.[1];
 const description=html.match(/<meta name="description" content="([^"]+)"/)?.[1];
 if(!title||!description)throw Error('Missing pilot search metadata: '+pilot);
 catalog.items.push({title,category:lang==='en'?'Help and support':'Pomoc i wsparcie',url,description,tags:['CC Pomoc','CC Help','dlugi','debt help'],type:'page',access:'public',lang});
}
catalog.totalItems=catalog.items.length;catalog.updatedAt=new Date().toISOString();
const serialized=JSON.stringify(catalog,null,2)+'\n';
await writeFile(path.join(root,'szukaj/catalog.json'),serialized);await writeFile(path.join(root,'data/cc-search-index.json'),serialized);
let sitemap=await readFile(path.join(root,'sitemap.xml'),'utf8');
const helpUrls=[...new Set([...urls,origin+'/dlugi',origin+'/en/debt-help'])];
if(sitemap.includes('<sitemapindex')){
 const helpSitemap=origin+'/sitemaps/cc-pomoc.xml';
 await mkdir(path.join(root,'sitemaps'),{recursive:true});
 await writeFile(path.join(root,'sitemaps/cc-pomoc.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+helpUrls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')+'\n</urlset>\n');
 if(!sitemap.includes(`<loc>${helpSitemap}</loc>`))sitemap=sitemap.replace('</sitemapindex>',`  <sitemap><loc>${helpSitemap}</loc></sitemap>\n</sitemapindex>`);
}else{
 for(const url of helpUrls)if(!sitemap.includes(`<loc>${url}</loc>`))sitemap=sitemap.replace('</urlset>',`  <url><loc>${url}</loc></url>\n</urlset>`);
}
await writeFile(path.join(root,'sitemap.xml'),sitemap);
const hub=renderHelpHub(await readFile(path.join(root,'help.html'),'utf8'));
await writeFile(path.join(root,'help.html'),hub);
await mkdir(path.join(root,'help'),{recursive:true});
await writeFile(path.join(root,'help/index.html'),hub);
const mapPath=path.join(root,'data/ecosystem-map.json');
const map=JSON.parse(await readFile(mapPath,'utf8'));
const topicIds=new Set(topics.map(t=>'cc-help-'+t.id));
map.nodes=map.nodes.filter(n=>!topicIds.has(n.id));
for(const t of topics)map.nodes.push({id:'cc-help-'+t.id,branchId:'misja-wspolpraca',name:'CC Pomoc — '+t.pl.name,shortDesc:t.pl.lead,fullDesc:'Informacyjna strona PL/EN z pierwszymi krokami i oficjalnymi źródłami pomocy w Polsce. Nabór trwa; bez ogłoszonych dyżurów.',type:'portal',url:origin+'/'+t.route,status:'active',lang:'pl',icon:'🤝',category:'Misja i współpraca',keywords:[t.pl.name,t.en.name,'CC Pomoc','wsparcie'],connections:['cc-help-debt']});
await writeFile(mapPath,JSON.stringify(map,null,2)+'\n');
console.log(`Generated ${topics.length*2} pages (flat + directory copies); search: ${catalog.totalItems} entries.`);

