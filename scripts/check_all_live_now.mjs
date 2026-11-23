import { ALL_CHANNELS } from './all_channels_config.mjs';

async function checkChannel(ch) {
  const url = `https://www.youtube.com/${encodeURI(ch.handle)}/live`;
  try {
    const res = await fetch(url, {
      headers: {
        'Cookie': 'SOCS=CAESEwgDEgk2OTg1MDk0MzQaAnBsIAEaBgiA_L-4Bg;',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow'
    });
    const html = await res.text();
    const isLive = html.includes('"isLiveNow":true') || (html.includes('"isLive":true') && !html.includes('LIVE_STREAM_OFFLINE'));
    const playOk = html.includes('"playabilityStatus":{"status":"OK"');
    const isOffline = html.includes('LIVE_STREAM_OFFLINE') || html.includes('Wydarzenie na żywo zacznie się');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Brak';
    const finalUrl = res.url;
    const vidMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = vidMatch ? vidMatch[1] : null;

    return {
      channel: ch.channelName,
      handle: ch.handle,
      videoId,
      isLiveNow: isLive && playOk,
      isOffline,
      title: title.slice(0, 50),
      url: finalUrl
    };
  } catch (e) {
    return { channel: ch.channelName, handle: ch.handle, error: e.message };
  }
}

async function main() {
  console.log('=== SPRAWDZANIE STATUSU PUBLICZNEGO TRANSMISJI LIVE (Z CIASTECZKIEM ZGODY) ===\n');
  for (const ch of ALL_CHANNELS) {
    const r = await checkChannel(ch);
    let statusIcon = '🔴 BRAK';
    if (r.isLiveNow) {
      statusIcon = '🟢 LIVE!';
    } else if (r.isOffline) {
      statusIcon = '🟡 ZAPLANOWANA (OFFLINE)';
    }
    console.log(`${statusIcon.padEnd(25)} | ${r.channel.padEnd(28)} | ${r.handle.padEnd(25)} | vid: ${r.videoId || '-'}`);
  }
}

main().catch(console.error);
