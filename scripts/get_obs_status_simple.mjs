import crypto from 'node:crypto';

const OBS_HOST = 'ws://192.168.50.217:4455';
const OBS_PASSWORD = '6qPcL0sXrVvs6sPN';

const ws = new WebSocket(OBS_HOST);

ws.onmessage = async (e) => {
  const msg = JSON.parse(e.data);
  if (msg.op === 0 && msg.d.authentication) {
    const { challenge, salt } = msg.d.authentication;
    const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
    const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
    ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
  } else if (msg.op === 2) {
    ws.send(JSON.stringify({ op: 6, d: { requestType: 'GetStreamStatus', requestId: 'req1' } }));
  } else if (msg.op === 7 && msg.d.requestId === 'req1') {
    console.log('OBS Stream Status:', JSON.stringify(msg.d.responseData, null, 2));
    ws.send(JSON.stringify({ op: 6, d: { requestType: 'GetOutputList', requestId: 'req2' } }));
  } else if (msg.op === 7 && msg.d.requestId === 'req2') {
    console.log('Outputs:', JSON.stringify(msg.d.responseData, null, 2));
    ws.close();
  }
};
