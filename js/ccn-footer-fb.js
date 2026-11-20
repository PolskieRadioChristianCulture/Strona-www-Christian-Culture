/**
 * Shared footer enhancer for all CCN thematic portals on polskieradio.cc.
 * Upgrades placeholder Facebook links to https://www.facebook.com/CCNews.ChristianCulture
 * with the official circular #1877F2 Facebook SVG icon (min 44x44 px touch target),
 * or appends the clickable badge cleanly if a CCN portal footer lacks one.
 */
(function () {
  'use strict';
  if (window._ccnFooterFbInitialized) return;
  window._ccnFooterFbInitialized = true;

  var FB_PAGE_URL = 'https://www.facebook.com/CCNews.ChristianCulture';
  var FB_LABEL = 'Oficjalna strona CCN News na Facebooku';
  var FB_PATH_D =
    'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.099 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.099 24 12.073z';

  function buildFbSvg(sizePx) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', String(sizePx));
    svg.setAttribute('height', String(sizePx));
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(ns, 'path');
    path.setAttribute('d', FB_PATH_D);
    svg.appendChild(path);
    return svg;
  }

  function applyCommonAnchorAttrs(anchor) {
    anchor.href = FB_PAGE_URL;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', FB_LABEL);
    anchor.setAttribute('title', FB_LABEL);
  }

  function upgradeExistingFooterAnchors(footer) {
    var anchors = footer.querySelectorAll('a[href*="facebook.com"]');
    var foundNative = false;
    anchors.forEach(function (anchor) {
      if (anchor.getAttribute('data-ccn-fb-native') === '1') {
        foundNative = true;
        return;
      }
      applyCommonAnchorAttrs(anchor);
      if (anchor.getAttribute('data-ccn-fb-upgraded') === '1') {
        foundNative = true;
        return;
      }
      anchor.setAttribute('data-ccn-fb-upgraded', '1');
      anchor.style.minWidth = '44px';
      anchor.style.minHeight = '44px';
      anchor.style.width = '44px';
      anchor.style.height = '44px';
      anchor.style.borderRadius = '9999px';
      anchor.style.background = '#1877F2';
      anchor.style.color = '#ffffff';
      anchor.style.border = 'none';
      anchor.style.display = 'inline-flex';
      anchor.style.alignItems = 'center';
      anchor.style.justifyContent = 'center';
      anchor.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.32)';
      anchor.textContent = '';
      anchor.appendChild(buildFbSvg(22));
      foundNative = true;
    });
    return foundNative;
  }

  function appendFooterBadgeIfMissing(footer) {
    if (footer.querySelector('a[href*="CCNews.ChristianCulture"], [data-ccn-fb-badge="1"]')) {
      return;
    }
    var wrap = document.createElement('div');
    wrap.setAttribute('data-ccn-fb-badge', '1');
    wrap.style.marginTop = '16px';
    wrap.style.display = 'flex';
    wrap.style.justifyContent = 'center';

    var link = document.createElement('a');
    applyCommonAnchorAttrs(link);
    link.setAttribute('data-ccn-fb-native', '1');
    link.style.display = 'inline-flex';
    link.style.alignItems = 'center';
    link.style.gap = '10px';
    link.style.minHeight = '44px';
    link.style.minWidth = '44px';
    link.style.padding = '8px 16px';
    link.style.borderRadius = '9999px';
    link.style.background = 'rgba(24, 119, 242, 0.16)';
    link.style.border = '1px solid rgba(24, 119, 242, 0.5)';
    link.style.color = '#ffffff';
    link.style.fontWeight = '700';
    link.style.fontSize = '14px';
    link.style.textDecoration = 'none';

    var iconWrap = document.createElement('span');
    iconWrap.style.width = '24px';
    iconWrap.style.height = '24px';
    iconWrap.style.borderRadius = '9999px';
    iconWrap.style.background = '#1877F2';
    iconWrap.style.display = 'inline-flex';
    iconWrap.style.alignItems = 'center';
    iconWrap.style.justifyContent = 'center';
    iconWrap.appendChild(buildFbSvg(15));

    var label = document.createElement('span');
    label.textContent = 'CCN News na Facebooku';

    link.appendChild(iconWrap);
    link.appendChild(label);
    wrap.appendChild(link);

    var container = footer.firstElementChild || footer;
    container.appendChild(wrap);
  }

  function enhanceCcnFooters() {
    var footers = document.querySelectorAll('footer');
    footers.forEach(function (footer) {
      if (footer.classList && footer.classList.contains('cc-support-footer')) return;
      var hasFb = upgradeExistingFooterAnchors(footer);
      if (!hasFb) {
        appendFooterBadgeIfMissing(footer);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCcnFooters);
  } else {
    enhanceCcnFooters();
  }

  if (typeof MutationObserver !== 'undefined' && document.body) {
    var observer = new MutationObserver(function () {
      enhanceCcnFooters();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.setTimeout(function () {
      observer.disconnect();
    }, 15000);
  }
})();
