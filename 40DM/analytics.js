// Only a consented page view. Prayer actions, replies, account IDs and query parameters stay outside GA4.
const id = 'G-Y4EFTVBPE3';
const key = 'cc-40dm-analytics-consent';
const en = document.documentElement.lang === 'en';
const status = document.getElementById('analytics-status');
let started = false;
function setConsent(granted, persist = true) {
  if (persist) try { localStorage.setItem(key, granted ? 'yes' : 'no'); } catch {}
  window['ga-disable-' + id] = !granted;
  if (started) window.gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' });
  if (granted && !started && location.origin === 'https://polskieradio.cc') {
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    const {gtag} = window;
    gtag('consent','default',{ analytics_storage:'denied', ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied' });
    gtag('consent','update',{ analytics_storage:'granted' });
    gtag('js', new Date());
    const page = {
      page_location: document.querySelector('link[rel="canonical"]').href,
      page_title: document.title,
      page_referrer: '',
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false
    };
    try {
      const q = new URLSearchParams(location.search);
      if (q.get('cc_team') === '1' || localStorage.getItem('cc_team') === '1' || window.obsstudio) page.traffic_type = 'internal';
    } catch {}
    gtag('config',id,page);
    gtag('event','page_view',page);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  status.textContent = granted ? (en ? 'Page statistics are enabled.' : 'Statystyki odsłon są włączone.')
    : (en ? 'Page statistics are disabled.' : 'Statystyki odsłon są wyłączone.');
}
document.getElementById('analytics-allow').addEventListener('click', () => setConsent(true));
document.getElementById('analytics-deny').addEventListener('click', () => setConsent(false));
let consent = false;
try { consent = localStorage.getItem(key) === 'yes'; } catch {}
setConsent(consent, false);
