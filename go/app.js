import { CONFIG } from './config.js';

const $ = (selector) => document.querySelector(selector);
const collator = new Intl.Collator('pl', { sensitivity: 'base' });
const escapeHtml = (text) => String(text).replace(/[&<>"']/g, (char) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
const normalize = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pl');
const validPublicUrl = (item) => {
  if (item.requiresReview || item.visibility === 'internal' || item.visibility === 'private') return null;
  if (item.path && /^\/[A-Za-z0-9/_-]+$/.test(item.path) && !/^\/(?:mapa|master|admin|skrzynka|nadawaj)(?:\/|$)/i.test(item.path)) return `${CONFIG.origin}${item.path}`;
  if (item.url) { try { const url = new URL(item.url); return url.protocol === 'https:' ? url.href : null; } catch { return null; } }
  return null;
};
const iconIds = Object.freeze({spark:'cross',radio:'radio',tv:'tv',headphones:'headphones',graduation:'cap',users:'users',newspaper:'news',book:'book',film:'film',music:'music',sun:'sun',heart:'heart',palette:'palette',search:'search',download:'download',zap:'zap',smile:'smile',calendar:'calendar',wave:'wave',sprout:'sprout',globe:'globe',chat:'chat',message:'chat'});
const icon = (name) => `<svg class="ic" aria-hidden="true"><use href="#i-${iconIds[name] || name || 'cross'}"/></svg>`;
const TONES = new Set(['amber','blue','violet','teal','mint','pink','navy','sunset','sunrise']);
const tone = (item) => TONES.has(item.color) ? item.color : 'blue';
const slug = (text) => normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const state = {items:[], shelves:[], category:'Wszystkie', query:'', favorites:new Set()};
try { state.favorites = new Set(JSON.parse(localStorage.getItem('ccgo_favorites_v2') || '[]')); } catch { state.favorites = new Set(); }

function track(action, label) {
  // Only use the host's existing consent-managed GA4 installation. Never inject a second GA snippet here.
  if (CONFIG.analytics.enabled && CONFIG.analytics.consentGranted && typeof window.gtag === 'function') {
    window.gtag('event', action, { event_category:'CC GO', content_id:label });
  }
}
function linkFor(item) { return validPublicUrl(item); }
function favButton(item) {
  const saved = state.favorites.has(item.id);
  return `<button type="button" class="favorite-btn ${saved ? 'is-saved' : ''}" data-favorite="${escapeHtml(item.id)}" aria-label="${saved ? 'Usuń z Mojej półki' : 'Dodaj do Mojej półki'}: ${escapeHtml(item.title)}" aria-pressed="${saved}">${icon('heart')}</button>`;
}
function openLink(item, url, label) {
  const external = !url.startsWith(CONFIG.origin);
  return `<a href="${escapeHtml(url)}" class="card-open" data-track="${escapeHtml(item.id)}"${external ? ' rel="noopener"' : ''} aria-label="Otwórz ${escapeHtml(item.title)}">${label}</a>`;
}
/* Okładka na półce — styl Empik GO */
function cover(item) {
  const url = linkFor(item);
  if (!url) return '';
  return `<article class="cover tone-${tone(item)}" data-id="${escapeHtml(item.id)}">${favButton(item)}<div class="cover-icon">${icon(item.icon)}</div><div class="cover-txt">${item.badge ? `<span class="cover-badge">${escapeHtml(item.badge)}</span>` : ''}<h3>${escapeHtml(item.title)}</h3><i class="card-bar" aria-hidden="true"></i><p>${escapeHtml(item.subtitle || item.description)}</p></div>${openLink(item, url, '<span class="sr-only">Otwórz</span>')}</article>`;
}
/* Wiersz w katalogu */
function card(item) {
  const url = linkFor(item);
  if (!url) return '';
  return `<article class="service-card list-card" data-id="${escapeHtml(item.id)}"><div class="card-thumb tone-${tone(item)}">${icon(item.icon)}</div><div class="card-content"><span class="card-category">${escapeHtml(item.category)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.subtitle || item.description)}</p></div><div class="card-foot">${openLink(item, url, `Odkryj ${icon('ext')}`)}${favButton(item)}</div></article>`;
}
function shelf(id, title, items, opts = {}) {
  return `<section class="shelf" id="${id}" aria-labelledby="${id}-h"><div class="shelf-head"><h2 id="${id}-h">${escapeHtml(title)}</h2>${opts.more ? `<button type="button" class="shelf-more" data-show-category="${escapeHtml(opts.more)}">Zobacz wszystkie ${icon('arrow')}</button>` : ''}</div><div class="shelf-row" role="list">${items.map(item => `<div role="listitem">${cover(item)}</div>`).join('')}</div></section>`;
}
function renderShelves() {
  const html = state.shelves.map(name => {
    const items = state.items.filter(item => item.category === name);
    return items.length ? shelf('polka-' + slug(name), name, items, {more:name}) : '';
  }).join('');
  $('#shelves').innerHTML = html;
}
function renderMyShelf() {
  const mine = state.items.filter(item => state.favorites.has(item.id));
  $('#myShelf').innerHTML = mine.length
    ? shelf('moja-polka-lista', 'Moja półka', mine).replace('class="shelf"', 'class="shelf mine"')
    : `<div class="shelf mine-empty"><div class="shelf-head"><h2>Moja półka</h2></div><p>Dotknij ${icon('heart')} na dowolnej okładce, a serwis trafi tutaj. Półka zapisuje się tylko na tym urządzeniu.</p></div>`;
}
function dayIndex() {
  // UTC day index for a stable daily editorial suggestion; no tracking or personal profiling.
  const today = new Date();
  return Math.floor(Date.UTC(today.getUTCFullYear(),today.getUTCMonth(),today.getUTCDate()) / 86400000);
}
function renderHero() {
  const pool = state.items.filter(item => item.spotlight && linkFor(item));
  if (!pool.length) { $('#heroRow').parentElement.hidden = true; return; }
  const start = ((dayIndex() % pool.length) + pool.length) % pool.length;
  const slides = [...pool.slice(start), ...pool.slice(0, start)].slice(0, 6);
  $('#heroRow').innerHTML = slides.map((item, i) => `<a class="hero-slide tone-${tone(item)}" href="${escapeHtml(linkFor(item))}" data-track="${escapeHtml(item.id)}"><span class="hero-txt"><small>${i === 0 ? 'PROPOZYCJA NA DZIŚ' : escapeHtml(item.category.toUpperCase())}</small><b>${escapeHtml(item.title)}</b><span>${escapeHtml(item.subtitle)}</span><em>Odkryj ${icon('arrow')}</em></span><span class="hero-art">${icon(item.icon)}</span></a>`).join('');
}
function renderFilters() {
  const categories = ['Wszystkie', ...state.shelves.filter(c => state.items.some(i => i.category === c))];
  $('#filters').innerHTML = categories.map(category => `<button type="button" class="filter-chip ${state.category === category ? 'active' : ''}" data-category="${escapeHtml(category)}" aria-pressed="${state.category === category}">${escapeHtml(category)}</button>`).join('');
}
function renderCatalog() {
  const visible = state.items.filter(item => (state.category === 'Wszystkie' || item.category === state.category) && normalize([item.title,item.subtitle,item.description,...(item.tags || [])].join(' ')).includes(normalize(state.query))).sort((a,b)=>collator.compare(a.title,b.title));
  $('#catalogGrid').innerHTML = visible.map(item => card(item)).join('');
  const n = visible.length;
  $('#catalogCount').textContent = `${n} ${n === 1 ? 'serwis' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 'serwisy' : 'serwisów'}`;
  $('#emptyState').hidden = n > 0;
}
function rerenderFavorites() { renderMyShelf(); renderShelves(); renderCatalog(); }
function bindEvents() {
  $('#catalogSearch').addEventListener('input', (e)=> { state.query = e.target.value.trim(); renderCatalog(); });
  $('#filters').addEventListener('click', (e) => { const button = e.target.closest('[data-category]'); if(!button)return; state.category = button.dataset.category; renderFilters(); renderCatalog(); });
  document.addEventListener('click', (e)=> {
    const favorite = e.target.closest('[data-favorite]');
    if(favorite){ const id = favorite.dataset.favorite; if(state.favorites.has(id)) state.favorites.delete(id); else state.favorites.add(id); try { localStorage.setItem('ccgo_favorites_v2', JSON.stringify([...state.favorites])); } catch {} rerenderFavorites(); return; }
    const more = e.target.closest('[data-show-category]');
    if (more) { state.category = more.dataset.showCategory; state.query = ''; $('#catalogSearch').value = ''; renderFilters(); renderCatalog(); $('#katalog').scrollIntoView({behavior:'smooth'}); return; }
    const focusSearch = e.target.closest('[data-focus-search]');
    if (focusSearch) { e.preventDefault(); $('#katalog').scrollIntoView({behavior:'smooth'}); setTimeout(()=>$('#catalogSearch').focus({preventScroll:true}), 350); return; }
    const link = e.target.closest('a[data-track]');
    if (link) track('select_content', link.dataset.track);
  });
  document.addEventListener('keydown',(e)=> { if(e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){ e.preventDefault(); $('#catalogSearch').focus(); $('#katalog').scrollIntoView({behavior:'smooth'}); }});
}
let deferredInstall;
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); deferredInstall = event; $('#installBtn').hidden = false; });
$('#installBtn').addEventListener('click', async()=> { if (!deferredInstall) return; deferredInstall.prompt(); await deferredInstall.userChoice; deferredInstall = null; $('#installBtn').hidden = true; });
window.addEventListener('appinstalled',()=>{$('#installBtn').hidden=true;});

async function init() {
  $('#year').textContent = new Date().getFullYear();
  bindEvents();
  try {
    const response = await fetch('/go/catalog.json', {cache:'no-store'});
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    if(data.visibility !== 'PUBLIC_ONLY' || !Array.isArray(data.items)) throw new Error('Błędny katalog publiczny');
    state.items = data.items.filter(item => linkFor(item) && item.id && item.title && item.category);
    state.shelves = Array.isArray(data.shelves) ? data.shelves : [...new Set(state.items.map(i => i.category))];
    renderMyShelf(); renderHero(); renderShelves(); renderFilters(); renderCatalog();
  } catch (err) {
    console.error('CC GO: katalog niedostępny', err);
    $('#shelves').innerHTML = '<p class="error-message">Nie można teraz załadować katalogu. Odwiedź <a href="/">Christian Culture</a> lub <a href="/wyszukiwarka">wyszukiwarkę CC</a>.</p>';
    $('#heroRow').parentElement.hidden = true;
    $('#catalogGrid').innerHTML = '';
    $('#catalogCount').textContent = 'Niedostępny';
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    // init() czeka na katalog, więc zdarzenie load zwykle już minęło — wtedy rejestrujemy od razu.
    const registerWorker = ()=>navigator.serviceWorker.register('/go/sw.js?v=2.2.3', {scope:'/go/'}).catch(console.warn);
    if (document.readyState === 'complete') registerWorker();
    else window.addEventListener('load', registerWorker, {once:true});
  }
}
init();
export { validPublicUrl, normalize };
