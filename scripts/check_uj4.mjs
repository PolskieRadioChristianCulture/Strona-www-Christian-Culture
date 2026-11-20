async function check() {
  const r = await fetch('https://www.youtube.com/watch?v=Uj4c5N_gEaY');
  const text = await r.text();
  const isLive = text.includes('"isLive":true') || text.includes('badge-style-type-live-now');
  const isUpcoming = text.includes('"status":"UPCOMING"') || text.includes('Premiera') || text.includes('Rozpocznie się za');
  const title = (text.match(/<title>(.*?)<\/title>/) || [])[1];
  console.log('Video Uj4c5N_gEaY:');
  console.log('Title:', title);
  console.log('isLive:', isLive, 'isUpcoming:', isUpcoming);
}
check();
