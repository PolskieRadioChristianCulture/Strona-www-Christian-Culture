import { DAYS } from './data/days.js?v=20261104_materials1';
const daySelect = document.querySelector('#day');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
for (const day of DAYS) {
  const option = document.createElement('option');
  option.value = String(day.day);
  option.textContent = `Dzień ${day.day}`;
  daySelect.append(option);
}
function showDay(number) {
  const item = DAYS.find(day => day.day === number);
  if (!item) return;
  daySelect.value = String(number);
  document.querySelector('#day-number').textContent = `Dzień ${number} / 90`;
  document.querySelector('#day-topic').textContent = item.title;
  document.querySelector('#day-reflection').textContent = item.intro;
  document.querySelector('#day-stage').textContent = item.stage;
  document.querySelector('#day-question').textContent = item.question;
  document.querySelector('#day-action').textContent = item.action;
  document.querySelector('#day-source').textContent = `${item.reference}. ${item.source_notice}`;
  document.querySelector('#day-faith').textContent = item.optional_faith;
  document.querySelector('#day-evening').replaceChildren(...item.evening_questions.map(question => {
    const li = document.createElement('li'); li.textContent = question; return li;
  }));
  previous.disabled = number === 1;
  next.disabled = number === 90;
}
daySelect.addEventListener('change', () => showDay(Number(daySelect.value)));
previous.addEventListener('click', () => showDay(Number(daySelect.value) - 1));
next.addEventListener('click', () => showDay(Number(daySelect.value) + 1));
showDay(1);

const toggle = document.querySelector('.menu-toggle');
function mountSharedNavigation() {
  const edge=window.CCMobileEdge?.mount({legacy:toggle,placement:toggle,trigger:toggle,hideLegacy:false,profile:'journal',allowDesktop:true,canUseFullMenu:()=>false});
  const info=edge?.dialog.querySelector('[data-edge-key="info"]');
  if(info){info.setAttribute('aria-label','O pamiętniku THE JOURNAL');info.title='O pamiętniku THE JOURNAL';info.addEventListener('click',()=>document.querySelector('#pamietnik').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));}
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mountSharedNavigation,{once:true});
else mountSharedNavigation();
document.querySelector('#journal-newsletter-open').addEventListener('click',event=>{
  if (!window.CCNewsletter) return;
  event.preventDefault();
  const dialog=window.CCNewsletter.open({sourcePortal:'the-journal',topics:['the-journal']});
  dialog.querySelector('.cc-nl-title').textContent='Nowości THE JOURNAL';
  dialog.querySelector('.cc-nl-subtitle').textContent='Informacje o premierze książki, rozwoju aplikacji i nowych materiałach. Wybierasz, co chcesz otrzymywać.';
});

if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.about-copy, .inside-intro, .ritual-steps article').forEach(element => {
    element.classList.add('reveal', 'pending'); observer.observe(element);
  });
}
