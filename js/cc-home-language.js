/* Homepage language policy: explicit URL, remembered choice, browser, English. */
(function (window, document) {
  'use strict';
  var KEY = 'cc_user_lang_choice';
  var COOKIE = 'cc_lang_pref';
  function supported(value) {
    value = String(value || '').toLowerCase().replace(/_/g, '-').split('-')[0];
    return value === 'pl' || value === 'en' ? value : null;
  }
  function read(storage, key) {
    try { return window[storage].getItem(key); } catch (_) { return null; }
  }
  function write(storage, key, value) {
    try { window[storage].setItem(key, value); } catch (_) {}
  }
  function cookieChoice() {
    try {
      var match = document.cookie.match(/(?:^|;\s*)cc_lang_pref=([^;]*)/);
      return match ? supported(decodeURIComponent(match[1])) : null;
    } catch (_) { return null; }
  }
  function resolve() {
    var urlChoice;
    try { urlChoice = supported(new URL(window.location.href).searchParams.get('lang')); } catch (_) {}
    if (urlChoice) return urlChoice;
    var remembered = supported(read('localStorage', KEY)) || cookieChoice();
    if (remembered) return remembered;
    // Old code forced lumina_lang=pl on every visit, so it is not proof of a manual choice.
    if (read('sessionStorage', 'lumina_explicit_en') === '1' && read('localStorage', 'lumina_lang') === 'en') return 'en';
    var languages = window.navigator.languages || [window.navigator.language];
    for (var i = 0; i < languages.length; i++) {
      var candidate = supported(languages[i]);
      if (candidate) return candidate;
    }
    return 'en';
  }
  var current = resolve();
  function sync() {
    document.documentElement.lang = current;
    // Keep the existing translation widget in sync before its first request.
    // Remove older domain cookies as well, so switching back to Polish is reliable.
    var host = window.location.hostname;
    var domains = ['', host, '.' + host];
    if (host.split('.').length > 2) domains.push('.' + host.split('.').slice(-2).join('.'));
    try {
      domains.forEach(function (domain) {
        document.cookie = 'googtrans=; Max-Age=0; Path=/' + (domain ? '; Domain=' + domain : '');
      });
      document.cookie = 'googtrans=/pl/' + current + '; Path=/; SameSite=Lax';
    } catch (_) {}
    write('localStorage', 'lumina_lang', current);
  }
  function choose(locale) {
    locale = supported(locale);
    if (!locale) return;
    write('localStorage', KEY, locale);
    try { document.cookie = COOKIE + '=' + locale + '; Path=/; Max-Age=31536000; SameSite=Lax'; } catch (_) {}
    current = locale;
    sync();
    // A manual selection supersedes a one-off language link.
    var url = new URL(window.location.href);
    url.searchParams.delete('lang');
    if (url.href !== window.location.href) window.location.replace(url.href);
    else window.location.reload();
  }
  window.CCHomeLanguage = { get: function () { return current; }, choose: choose };
  sync();
})(window, document);
