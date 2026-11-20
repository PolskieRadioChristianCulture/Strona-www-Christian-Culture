async function check(id) {
  const r = await fetch(`https://www.youtube.com/watch?v=${id}`);
  const text = await r.text();
  const isLive = text.includes('"isLive":true') || text.includes('badge-style-type-live-now');
  const isUpcoming = text.includes('"status":"UPCOMING"') || text.includes('Premiera') || text.includes('Rozpocznie się za');
  const title = (text.match(/<title>(.*?)<\/title>/) || [])[1];
  console.log(`Video ${id}: title="${title}", isLive=${isLive}, isUpcoming=${isUpcoming}`);
}
check('uM2wTwxLck8');
