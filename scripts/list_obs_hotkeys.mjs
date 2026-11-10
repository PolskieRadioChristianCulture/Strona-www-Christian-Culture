import crypto from 'node:crypto';

const ws = new WebSocket('ws://192.168.50.217:4455');

function send(type, data = {}) {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const timer = setTimeout(() => reject(new Error('timeout ' + type)), 5000);
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', h);
        resolve(m.d.responseData);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  if (msg.op === 0 && msg.d.authentication) {
    const { challenge, salt } = msg.d.authentication;
    const secret = crypto.createHash('sha256').update('6qPcL0sXrVvs6sPN' + salt).digest('base64');
    const auth = crypto.createHash('sha256').update(secret + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
  } else if (msg.op === 2) {
    const res = await send('GetHotkeyList');
    const aitumHotkeys = (res.hotkeys || []).filter(h => h.includes('Aitum') || h.includes('CC TV'));
    console.log('Aitum hotkeys:', JSON.stringify(aitumHotkeys, null, 2));
    ws.close();
  }
};
