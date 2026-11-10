async function check() {
  const r = await fetch('https://polskieradio.cc/?_t=' + Date.now());
  const t = await r.text();
  const m = t.match(/src="[^"]*app\.js[^"]*"/g);
  console.log('Script tag in index.html:', m);
}
check();
