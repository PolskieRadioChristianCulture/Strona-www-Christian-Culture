import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

const ws = new WebSocket(OBS_HOST);

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
  if (m.op === 0 && m.d.authentication) {
    const { challenge, salt } = m.d.authentication;
    const s = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
    const a = crypto.createHash('sha256').update(s + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: a } }));
  } else if (m.op === 2) {
    const streamStatus = await send('GetStreamStatus');
    console.log('Stream Status:', streamStatus);

    const service = await send('GetStreamServiceSettings');
    console.log('Main Stream Key:', service.streamServiceSettings?.key);
    console.log('Main Server:', service.streamServiceSettings?.server);

    const inputSettings = await send('GetInputSettings', { inputName: 'Przeglądarka' });
    console.log('Current Browser Source URL:', inputSettings.inputSettings?.url);

    ws.close();
    process.exit(0);
  }
};
