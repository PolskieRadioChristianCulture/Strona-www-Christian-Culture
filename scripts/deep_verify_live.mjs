// Głęboka weryfikacja — sprawdza czy YouTube faktycznie streamuje (viewer count, broadcast ID, itp.)
const channels = [
  { handle: '@ChristianCultureTV', name: 'Christian Culture TV' },
  { handle: '@osobowoscPLUS', name: 'Osobowość +' },
  { handle: '@RadioChristianCulture', name: 'Polskie Radio CC' },
  { handle: '@bibliaaudiocc', name: 'Biblia Audio CC' },
  { handle: '@wersetdnia_ChSB', name: 'Werset Dnia' },
  { handle: '@CCWomen7', name: 'CC Women' },
  { handle: '@CCMen7', name: 'CC Men' },
];

async function deepCheck(channel) {
  const url = `https://www.youtube.com/${channel.handle}/live`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow'
    });
    const html = await res.text();
    
    // Sprawdź broadcast ID
    const broadcastIdMatch = html.match(/"broadcastId":"([^"]+)"/);
    const broadcastId = broadcastIdMatch ? broadcastIdMatch[1] : null;
    
    // Status transmisji
    const isLiveStatus = html.includes('"status":"LIVE"') || html.includes('"isLive":true');
    const isUpcoming = html.includes('"status":"UPCOMING"') || html.includes('"isUpcoming":true');
    
    // Liczba widzów
    const viewersMatch = html.match(/"viewCount":"?(\d+)"?/) || html.match(/(\d+)\s*(oglądają|watching)/);
    const viewers = viewersMatch ? viewersMatch[1] : 'nieznana';
    
    // Tytuł transmisji
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';
    
    // Sprawdź canonical URL z ID wideo
    const canonicalMatch = html.match(/"canonicalBaseUrl":"\/watch\?v=([^"]+)"/);
    const videoId = canonicalMatch ? canonicalMatch[1] : null;
    
    // Sprawdź czas trwania transmisji
    const durationMatch = html.match(/"streamLength":(\d+)/);
    const streamSeconds = durationMatch ? parseInt(durationMatch[1]) : null;
    const streamDuration = streamSeconds ? `${Math.floor(streamSeconds/3600)}h ${Math.floor((streamSeconds%3600)/60)}m` : 'nieznany';
    
    return {
      name: channel.name,
      handle: channel.handle,
      isLive: isLiveStatus,
      isUpcoming,
      broadcastId,
      videoId,
      viewers,
      streamDuration,
      title,
      finalUrl: res.url
    };
  } catch (err) {
    return { name: channel.name, handle: channel.handle, error: err.message };
  }
}

async function main() {
  console.log('=== GŁĘBOKA WERYFIKACJA TRANSMISJI LIVE ===\n');
  for (const ch of channels) {
    const r = await deepCheck(ch);
    if (r.error) {
      console.log(`❌ ${r.name} (${r.handle}): BŁĄD — ${r.error}`);
    } else {
      const status = r.isLive ? '🟢 LIVE' : (r.isUpcoming ? '⏳ ZAPLANOWANA' : '🔴 OFFLINE');
      console.log(`${status} | ${r.name}`);
      console.log(`   Handle: ${r.handle}`);
      console.log(`   Tytuł: ${r.title}`);
      if (r.videoId)     console.log(`   Video ID: ${r.videoId} -> https://youtube.com/watch?v=${r.videoId}`);
      if (r.broadcastId) console.log(`   Broadcast ID: ${r.broadcastId}`);
      console.log(`   Widzowie (raw): ${r.viewers}`);
      if (r.streamDuration !== 'nieznany') console.log(`   Czas trwania: ${r.streamDuration}`);
      console.log('');
    }
  }
}

main().catch(console.error);
