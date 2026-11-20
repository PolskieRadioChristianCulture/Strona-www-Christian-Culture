import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

async function main() {
  const ws = new WebSocket(OBS_HOST);
  await new Promise((resolve, reject) => {
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.op === 0 && msg.d.authentication) {
        const { challenge, salt } = msg.d.authentication;
        const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
        const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
        ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
      } else if (msg.op === 2) resolve();
    };
    ws.onerror = reject;
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

  // Check scene collection list and profile list
  const scCols = await sendReq('GetSceneCollectionList');
  console.log('Kolekcje scen:', scCols.responseData);

  const profiles = await sendReq('GetProfileList');
  console.log('Profile:', profiles.responseData);

  // Sprawdź czy jest multiview / projektor
  // Sprawdź czy są jakieś inne sceny w tej kolekcji
  const scenes = await sendReq('GetSceneList');
  console.log('Sceny szczegółowo:', JSON.stringify(scenes.responseData, null, 2));

  ws.close();
}
main().catch(console.error);
