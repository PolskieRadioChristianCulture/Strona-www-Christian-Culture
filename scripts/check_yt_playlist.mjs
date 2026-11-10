async function check() {
  try {
    const res = await fetch('https://www.youtube.com/playlist?list=PLPkpY3wBciWM');
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'none');
    
    // Look for playlist video IDs or title
    const videoMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
    const uniqueVideos = [...new Set(videoMatches)];
    console.log('Found video count:', uniqueVideos.length);
    console.log('First 5 video IDs:', uniqueVideos.slice(0, 5));
  } catch(e) {
    console.error(e);
  }
}
check();
