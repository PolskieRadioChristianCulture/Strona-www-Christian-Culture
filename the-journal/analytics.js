// Optional page measurement only. Never inspect journal topics, selections or personal content.
(() => {
  'use strict';
  const id = 'G-Y4EFTVBPE3';
  const key = 'cc-journal-analytics-consent';
  const canonical = 'https://polskieradio.cc/the-journal';
  const status = document.getElementById('analytics-status');
  let started = false;
  let choice = 'denied';
  try { choice = localStorage.getItem(key) || 'denied'; } catch {}
  window['ga-disable-' + id] = true;
  function store(value) {try {localStorage.setItem(key,value);} catch {}}
  function configure() {
    if (started) return;
    started = true;
    window['ga-disable-' + id] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    gtag('consent','update',{analytics_storage:'granted'});
    gtag('js', new Date());
    const params = {send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:canonical,page_title:'THE JOURNAL — pamiętnik dla młodzieży',page_referrer:''};
    try {
      const query = new URLSearchParams(location.search);
      if (query.get('cc_team')==='1' || query.get('in_mcr')==='1' || localStorage.getItem('cc_team')==='1' || window.obsstudio) params.traffic_type='internal';
    } catch {}
    gtag('config',id,params);
    gtag('event','page_view',{page_location:canonical,page_title:params.page_title,page_referrer:'',...(params.traffic_type?{traffic_type:'internal'}:{})});
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
    document.head.append(script);
  }
  function allow() {choice='granted';store(choice);window['ga-disable-'+id]=false;if(started&&typeof window.gtag==='function')gtag('consent','update',{analytics_storage:'granted'});configure();status.textContent='Statystyki są włączone. Możesz je wyłączyć w każdej chwili.';}
  function deny() {choice='denied';store(choice);window['ga-disable-'+id]=true;if(started&&typeof window.gtag==='function')gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});status.textContent='Statystyki są wyłączone.';}
  document.getElementById('analytics-allow').addEventListener('click',allow);
  document.getElementById('analytics-deny').addEventListener('click',deny);
  if(choice==='granted')allow();
})();
