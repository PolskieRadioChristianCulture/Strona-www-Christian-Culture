import crypto from 'node:crypto';

const ws = new WebSocket('ws://192.168.50.217:4455');
const PASS = '6qPcL0sXrVvs6sPN';

function send(type, data = {}) {
  return new Promise((res, rej) => {
    const id = crypto.randomUUID();
    const h = (e) => {
      const m = JSON.parse(e.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        if (m.d.requestStatus.result) res(m.d.responseData);
        else rej(new Error(m.d.requestStatus.comment || 'failed'));
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });
}

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  if (msg.op === 0) {
    const a = msg.d.authentication;
    const secret = crypto.createHash('sha256').update(PASS + a.salt).digest('base64');
    const auth = crypto.createHash('sha256').update(secret + a.challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: auth } }));
  } else if (msg.op === 2) {
    console.log('Connected to OBS. Restarting Personality Plus with original key...');
    await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStopOutputPersonality Plus' }).catch(e => console.log(e.message));
    await new Promise(r => setTimeout(r, 1500));
    await send('TriggerHotkeyByName', { hotkeyName: 'AitumStreamSuiteStartOutputPersonality Plus' }).catch(e => console.log(e.message));
    await new Promise(r => setTimeout(r, 2000));
    ws.close();
    process.exit(0);
  }
};
