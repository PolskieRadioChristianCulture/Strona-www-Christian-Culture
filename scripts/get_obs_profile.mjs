import crypto from 'node:crypto';

const ws = new WebSocket('ws://192.168.50.217:4455');
function send(type, data = {}) {
  return new Promise((res, rej) => {
    const id = crypto.randomUUID();
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) res(m.d.responseData);
        else rej(new Error(m.d.requestStatus.comment || 'fail'));
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}
ws.onmessage = async (e) => {
  const m = JSON.parse(e.data);
  if (m.op === 0) {
    const { challenge, salt } = m.d.authentication;
    const s1 = crypto.createHash('sha256').update('6qPcL0sXrVvs6sPN' + salt).digest('base64');
    const auth = crypto.createHash('sha256').update(s1 + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth, eventSubscriptions: 0 } }));
  } else if (m.op === 2) {
    const profiles = await send('GetProfileList');
    console.log('Current profile:', profiles.currentProfileName);
    console.log('All profiles:', profiles.profiles);
    ws.close();
  }
};
