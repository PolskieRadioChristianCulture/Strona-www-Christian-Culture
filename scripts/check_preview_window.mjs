import crypto from 'node:crypto';
import fs from 'node:fs';

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
      } else if (msg.op === 2) {
        resolve();
      }
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

  const previewScene = await sendReq('GetCurrentPreviewScene');
  console.log('Current Preview Scene:', previewScene.responseData);

  // Sprawdź czy możemy pobrać zrzut sceny podglądu
  if (previewScene.responseData?.currentPreviewSceneName) {
    const pShot = await sendReq('GetSourceScreenshot', {
      sourceName: previewScene.responseData.currentPreviewSceneName,
      imageFormat: 'png',
      imageWidth: 1920,
      imageHeight: 1080
    });
    if (pShot.responseData?.imageData) {
      const b64 = pShot.responseData.imageData.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync('C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138/obs_preview_window.png', Buffer.from(b64, 'base64'));
      console.log('Zapisano zrzut podglądu.');
    }
  }

  // Sprawdź też, co jeśli wyłączymy tryb studia lub ustawimy scenę w podglądzie
  ws.close();
}

main().catch(console.error);
