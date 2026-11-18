/* Spiritual Sounds — wizytówka (WERSJA TESTOWA), @007 2026-11-18: menu mobilne + łagodne pojawianie się sekcji. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');

  var nav = document.querySelector('.ss-nav');
  var burger = document.querySelector('.ss-burger');
  if (nav && burger) {
    var setOpen = function (open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    nav.querySelectorAll('.ss-menu a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); burger.focus(); } });
  }

  var items = document.querySelectorAll('.ss-reveal');
  if (!('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
