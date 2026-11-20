import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

async function main() {
  const ws = new WebSocket(OBS_HOST);
  await new Promise((resolve) => {
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
        const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
      } else if (msg.op === 2) resolve();
    };
  });

  const sendReq = (type, data = {}) => new Promise((res) => {
    const id = crypto.randomUUID();
    const h = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.op === 7 && m.d.requestId === id) {
        ws.removeEventListener('message', h);
        res(m.d);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ op: 6, d: { requestType: type, requestId: id, requestData: data } }));
  });

  const rec = await sendReq('GetRecordDirectory');
  console.log('Record directory:', rec.responseData);

  const profile = await sendReq('GetProfileParameter', { parameterCategory: 'SimpleOutput', parameterName: 'FilePath' }).catch(() => null);
  console.log('Profile param:', profile);

  ws.close();
}
main().catch(console.error);
