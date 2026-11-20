import crypto from 'node:crypto';

const OBS_HOST = 'ws://127.0.0.1:4455';
const OBS_PASSWORD = 'zcPZNSKSv3o1g9gb';

async function main() {
  const ws = new WebSocket(OBS_HOST);
  let reqId = 1;
  const pending = new Map();

  function call(requestType, requestData = {}) {
    return new Promise((resolve, reject) => {
      const id = String(reqId++);
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ op: 6, d: { requestId: id, requestType, requestData } }));
    });
  }

  ws.onmessage = async (e) => {
    const msg = JSON.parse(e.data);
    if (msg.op === 0) {
      const { challenge, salt } = msg.d.authentication;
      const secretHash = crypto.createHash('sha256').update(OBS_PASSWORD + salt).digest('base64');
      const authResponse = crypto.createHash('sha256').update(secretHash + challenge).digest('base64');
      ws.send(JSON.stringify({ op: 1, d: { rpcVersion: 1, authentication: authResponse, eventSubscriptions: 33 } }));
    } else if (msg.op === 2) {
      console.log('Connected to local OBS. Refreshing browser source...');
      try {
        await call('PressInputPropertiesButton', {
          inputName: 'TVW — polskieradio.cc/tvw',
          propertyName: 'refreshnocache'
        });
        console.log('Refreshed TVW browser source in OBS!');
      } catch (err) {
        console.error('Refresh error:', err.message);
      }
      ws.close();
    } else if (msg.op === 7) {
      const p = pending.get(msg.d.requestId);
      if (p) {
        pending.delete(msg.d.requestId);
        if (msg.d.requestStatus.result) p.resolve(msg.d);
        else p.reject(new Error(msg.d.requestStatus.comment || 'Unknown error'));
      }
    }
  };
}
main();
