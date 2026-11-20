const videos = [
  'GIy5XdY5Slc',
  'ni9Ok9l-FsM',
  'FwxFkgtU0TU',
  '2v1jEoM_V1s',
  'ZBOR_8s4EEM',
  'P5ksyBwvfTo',
  '8n-UQTIZaeY',
  'yVlHl3yBWz4',
  'imwRKKntdMk'
];

async function check() {
  for (const id of videos) {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
    console.log(`Video ${id}: status ${res.status}`);
  }
}
check();
