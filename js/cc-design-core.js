/**
 * CC Design Core Runtime (Zero Dependencies, MIT-inspired Primitives)
 * Obsługuje:
 * - Kopiowanie do schowka z bezpiecznym fallbackiem
 * - Dostępne zakładki WAI-ARIA z obsługą klawiatury (ArrowLeft/Right/Home/End)
 * - Progresywne ujawnianie sekcji z poszanowaniem prefers-reduced-motion
 * - Zarządzanie tematem i archetypem rodziny wizualnej CC
 */

export async function copyToClipboard(value) {
  const text = String(value ?? '');
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fallback poniżej */
    }
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;inset-block-start:0;inset-inline-start:-9999px;opacity:0';
  const previousFocus = document.activeElement;
  document.body.append(field);
  field.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  field.remove();
  if (previousFocus && typeof previousFocus.focus === 'function') {
    previousFocus.focus();
  }
  return copied;
}

export function initTabs(container, onSelect) {
  if (!container) return;
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
  if (!tabs.length) return;

  function activate(tab, shouldFocus = false) {
    tabs.forEach(item => {
      const isActive = item === tab;
      item.setAttribute('aria-selected', String(isActive));
      item.tabIndex = isActive ? 0 : -1;
    });
    if (shouldFocus) tab.focus();
    if (typeof onSelect === 'function') {
      onSelect(tab.dataset.tab || 'all', tab);
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', event => {
      let nextIndex = -1;
      const isRtl = document.documentElement.dir === 'rtl';
      if (event.key === 'ArrowRight') nextIndex = isRtl ? index - 1 : index + 1;
      else if (event.key === 'ArrowLeft') nextIndex = isRtl ? index + 1 : index - 1;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;

      if (nextIndex >= 0 || event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const wrapped = (nextIndex + tabs.length) % tabs.length;
        activate(tabs[wrapped], true);
      }
    });
  });
}

export function initRevealMotion(root = document) {
  const reduced = typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const elements = Array.from(root.querySelectorAll('.cc-reveal'));
  if (!elements.length) return;

  if (reduced || typeof IntersectionObserver === 'undefined') {
    elements.forEach(el => { el.dataset.ccReveal = 'visible'; });
    return;
  }

  document.documentElement.classList.add('cc-motion-ready');

  const reveal = el => {
    if (el && el.dataset.ccReveal !== 'visible') {
      el.dataset.ccReveal = 'visible';
    }
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '40px 0px 40px 0px', threshold: 0.01 });

  const syncVisibleInViewport = () => {
    const thresholdY = (window.innerHeight || 800) + 40;
    elements.forEach(el => {
      if (el.dataset.ccReveal === 'visible') return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= thresholdY) {
        reveal(el);
        observer.unobserve(el);
      }
    });
  };

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= (window.innerHeight || 800) + 40) {
      reveal(el);
    } else {
      el.dataset.ccReveal = 'pending';
      observer.observe(el);
    }
  });

  const revealTargetAncestor = event => {
    const ancestor = event?.target?.closest?.('.cc-reveal');
    if (ancestor) {
      reveal(ancestor);
      observer.unobserve(ancestor);
    }
    syncVisibleInViewport();
  };

  window.addEventListener('scroll', syncVisibleInViewport, { passive: true });
  window.addEventListener('hashchange', syncVisibleInViewport);
  root.addEventListener('focusin', revealTargetAncestor);
  root.addEventListener('click', revealTargetAncestor, { passive: true });
}

export function applyArchetype(archetype = 'giving', theme = 'dark') {
  document.documentElement.setAttribute('data-cc-archetype', archetype);
  document.documentElement.setAttribute('data-cc-theme', theme);
}
