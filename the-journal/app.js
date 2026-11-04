import { DAYS } from './data/days.js';
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
  document.querySelector('#day-topic').textContent = item.topic;
  document.querySelector('#day-reflection').textContent = item.reflection;
  document.querySelector('#day-source').textContent = `Autorska refleksja. Inspiracja: ${item.source}. Nie jest dosłownym cytatem.`;
  previous.disabled = number === 1;
  next.disabled = number === 90;
}
daySelect.addEventListener('change', () => showDay(Number(daySelect.value)));
previous.addEventListener('click', () => showDay(Number(daySelect.value) - 1));
next.addEventListener('click', () => showDay(Number(daySelect.value) + 1));
showDay(1);

const menu = document.querySelector('#menu');
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => { menu.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
document.querySelector('#close-menu').addEventListener('click', () => menu.close());
menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); });
menu.addEventListener('click', event => { if (event.target === menu && event.clientX > menu.getBoundingClientRect().right) menu.close(); });
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => menu.close()));

if (matchMedia('(prefers-reduced-motion: no-preference)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('pending'); observer.unobserve(entry.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.about-copy, .inside-intro, .ritual-steps article').forEach(element => {
    element.classList.add('reveal', 'pending'); observer.observe(element);
  });
}
