/* ARK OF FIRE — wizytówka: zapasowy panel + oraz zapamiętanie języka */
(() => {
  const lang = (document.documentElement.lang || 'pl').slice(0, 2);
  try { localStorage.setItem('ekocc_locale', lang); } catch (e) {}

  document.querySelectorAll('[data-lang-switch]').forEach((link) => {
    link.addEventListener('click', () => {
      try { localStorage.setItem('ekocc_locale', link.getAttribute('hreflang')); } catch (e) {}
    });
  });

  // Gdy /js/cc-mobile-edge.js zamontuje panel EkoCC, usuwa ten przycisk i przejmuje rolę „+”.
  const open = document.querySelector('[data-open-drawer]');
  const drawer = document.getElementById('drawer');
  const close = document.querySelector('[data-close-drawer]');
  if (!open || !drawer || !close) return;

  const setDrawer = (visible) => {
    drawer.hidden = !visible;
    open.setAttribute('aria-expanded', String(visible));
    if (visible) close.focus();
    else if (open.isConnected) open.focus();
  };
  open.addEventListener('click', () => setDrawer(true));
  close.addEventListener('click', () => setDrawer(false));
  drawer.addEventListener('click', (e) => { if (e.target === drawer) setDrawer(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });
})();
