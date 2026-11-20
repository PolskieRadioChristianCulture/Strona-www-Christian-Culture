const res = await fetch('https://polskieradio.cc/master-live.html?t=' + Date.now(), {
  headers: { 'Cache-Control': 'no-cache, no-store' }
});
const text = await res.text();
console.log('Status:', res.status);
console.log('CF-Cache-Status:', res.headers.get('cf-cache-status'));
console.log('Contains DEKALOG in badge:', text.includes('<div class="dekalog-brand-title">DEKALOG</div>'));
console.log('Contains Boży Dekalog:', text.includes('Boży Dekalog'));
console.log('Contains bottom: 180px:', text.includes('bottom: 180px !important;'));
console.log('Contains translate3d in ccnTickerScroll:', text.includes('transform: translate3d(-50%, 0, 0);'));
