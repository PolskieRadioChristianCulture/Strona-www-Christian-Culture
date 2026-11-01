'use strict';
/* DEMONSTRATION DATA ONLY. Replace with authenticated API data in production. */
const pictureIds = [
 'photo-1500530855697-b586d89ba3ee','photo-1470252649378-9c29740c9fa8','photo-1516280440614-37939bbacd81','photo-1441974231531-c6227db76b6e','photo-1438232992991-995b7058bbb3','photo-1500534623283-312aade485b7','photo-1519608487953-e999c86e7455','photo-1470770841072-f978cf4d019e','photo-1490750967868-88aa4486c946','photo-1519681393784-d120267933ba','photo-1497366754035-f200968a6e72','photo-1473448912268-2022ce9509d8','photo-1481627834876-b7833e8f5570','photo-1451187580459-43490279c0fa','photo-1502082553048-f009c37129b9'];
const photo=(n)=>`https://images.unsplash.com/${pictureIds[n%pictureIds.length]}?auto=format&fit=crop&w=720&q=82`;
const create=(pairs)=>pairs.map(([title,artist],i)=>({rank:i+1,title,artist,cover:photo(i)}));
const charts=[
 {id:'notowania',title:'TopTen Global',featured:true,items:create([['Większy niż lęk','Mateusz Nowak'],['Twoja łaska','Anna Lech'],['Jezus żyje','Zespół Źródło'],['Prowadź mnie','Nowe Serce'],['Dom u Ciebie','Emilia Król']])},
 {id:'artysci',title:'Artyści Christian Culture',items:create([['Mateusz Nowak','Artysta'],['Anna Lech','Artystka'],['Zespół Źródło','Zespół'],['Emilia Król','Artystka'],['Nowe Serce','Zespół']])},
 {id:'muzyka',title:'Piosenki Radiowe',items:create([['Dzięki Ci, Panie','Mateusz Nowak'],['W Twojej obecności','Anna Lech'],['Zwycięstwo w Tobie','Zespół Źródło'],['Światło w ciemności','Nowe Serce'],['Na zawsze wierny','Emilia Król']])},
 {id:'debiuty',title:'Wschodzący Artyści',items:create([['Jakub Mularczyk','Debiut'],['Lena Sadowska','Debiut'],['Grupa Pokolenie','Debiut'],['Tomasz Wójcik','Debiut'],['Natalia Bielska','Debiut']])}
];
const $=(s)=>document.querySelector(s);
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const sections=$('#sections');
function renderCharts(filter=''){
 const q=filter.toLocaleLowerCase('pl').trim();
 sections.innerHTML=charts.map(chart=>{
 const items=chart.items.filter(x=>!q||`${x.title} ${x.artist}`.toLocaleLowerCase('pl').includes(q));
 if(!items.length)return '';
 return `<section class="chart-section" id="${chart.id}"><div class="section-header"><h2>${escapeHtml(chart.title)}</h2><button class="view-all" data-chart="${chart.id}" aria-label="Zobacz szczegóły: ${escapeHtml(chart.title)}">WYŚWIETL NOTOWANIA <span>→</span></button></div><div class="cards ${chart.featured?'featured':''}">${items.map((item,i)=>{
 const isLarge=chart.featured&&i===0&&!q;
 return `<article class="chart-card ${isLarge?'large':''}" data-item="${chart.id}:${item.rank}" tabindex="0" role="button" aria-label="Szczegóły: ${escapeHtml(item.title)}, ${escapeHtml(item.artist)}"><div class="cover"><img src="${item.cover}" alt="Ilustracja demonstracyjna: ${escapeHtml(item.title)}" loading="lazy" onerror="this.style.display='none'"><span class="rank">${item.rank}</span>${isLarge?'<button class="play" type="button" aria-label="Informacje o odtwarzaniu">▶</button>':''}</div><h3 class="card-title">${escapeHtml(item.title)}</h3><div class="artist-name">${escapeHtml(item.artist)}</div></article>`;
 }).join('')}</div></section>`;
 }).join('') || '<p class="empty-state">Brak utworów pasujących do zapytania.</p>';
}
let lastFocus=null;
function showModal(title,html){lastFocus=document.activeElement;$('#modalTitle').textContent=title;$('#modalBody').innerHTML=html;$('#modal').hidden=false;document.body.style.overflow='hidden';$('.modal-panel').focus()}
function closeModal(){$('#modal').hidden=true;document.body.style.overflow='';if(lastFocus?.focus)lastFocus.focus()}
function info(title){showModal(title,'<p>To prezentacja interfejsu topTEN. Dane demonstracyjne nie są prawdziwymi notowaniami. Ta funkcja będzie aktywna po integracji z serwerem, bazą danych i panelem redakcyjnym.</p>')}
renderCharts();
$('#modalClose').addEventListener('click',closeModal);
$('#modal').addEventListener('click',e=>{if(e.target.dataset.close)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});
sections.addEventListener('click',e=>{
 const chartButton=e.target.closest('[data-chart]');if(chartButton){info('Notowania — '+charts.find(c=>c.id===chartButton.dataset.chart).title);return;}
 const card=e.target.closest('[data-item]');if(!card)return;
 const [chartId,rank]=card.dataset.item.split(':');const item=charts.find(c=>c.id===chartId)?.items.find(x=>x.rank===Number(rank));if(item)showModal(item.title,`<p><strong>Artysta:</strong> ${escapeHtml(item.artist)}</p><p><strong>Pozycja demonstracyjna:</strong> ${item.rank}</p><p>W wersji produkcyjnej znajdziesz tu profil wykonawcy, oficjalną okładkę, autoryzowany odsłuch, historię notowań i możliwość oddania ważnego głosu.</p><button class="primary-btn" id="votePlaceholder">Głosowanie — wkrótce</button>`);
});
sections.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-item]')){e.preventDefault();e.target.click()}});
$('#menuToggle').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',String(open))});
$('#searchToggle').addEventListener('click',()=>{const field=$('#searchBar');field.hidden=!field.hidden;if(!field.hidden)$('#siteSearch').focus()});
$('#siteSearch').addEventListener('input',e=>renderCharts(e.target.value));
$('#clearSearch').addEventListener('click',()=>{$('#siteSearch').value='';renderCharts();$('#siteSearch').focus()});
$('#chartSelect').addEventListener('change',e=>{if(e.target.value)document.getElementById(e.target.value)?.scrollIntoView()});
const artistSelect=$('#artistSelect');[...new Set(charts.flatMap(c=>c.items.map(x=>x.artist)))].sort((a,b)=>a.localeCompare(b,'pl')).forEach(name=>{const op=document.createElement('option');op.value=name;op.textContent=name;artistSelect.append(op)});
artistSelect.addEventListener('change',e=>{if(e.target.value){$('#searchBar').hidden=false;$('#siteSearch').value=e.target.value;renderCharts(e.target.value);$('#main').scrollIntoView()}});
$('#loginButton').addEventListener('click',()=>info('Logowanie'));
$('#voteInfo').addEventListener('click',()=>showModal('Zasady głosowania','<p>Planowany model: jeden zweryfikowany głos na osobę w jednym tygodniowym notowaniu. Głosowanie jest bezpłatne. Wyniki będą publikowane po zakończeniu weryfikacji i usunięciu nadużyć.</p><p>W aktualnym podglądzie żadne głosy nie są przyjmowane ani zapisywane.</p><p><a href="/topTEN/regulamin.html">Przeczytaj projekt regulaminu →</a></p>'));
$('#archiveButton').addEventListener('click',()=>info('Archiwum notowań'));
