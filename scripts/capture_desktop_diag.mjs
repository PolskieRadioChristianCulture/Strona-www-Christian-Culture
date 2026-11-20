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

  console.log('1. Tworzę tymczasowe źródło monitor_capture...');
  const tempInputName = 'TempMonitorDiag';
  await sendReq('CreateInput', {
    sceneName: 'CHRISTIAN CULTURE TV24',
    inputName: tempInputName,
    inputKind: 'monitor_capture',
    inputSettings: {},
    sceneItemEnabled: false // Nie pokazuj widzom na żywo!
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log('2. Pobieram zrzut pulpitu nadajnika...');
  const shot = await sendReq('GetSourceScreenshot', {
    sourceName: tempInputName,
    imageFormat: 'png',
    imageWidth: 1920,
    imageHeight: 1080
  });

  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  if (shot.responseData?.imageData) {
    const b64 = shot.responseData.imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(`${artDir}/cc_nadajnik_desktop.png`, Buffer.from(b64, 'base64'));
    console.log('Zapisano zrzut ekranu:', `${artDir}/cc_nadajnik_desktop.png`);
  } else {
    console.log('Nie udało się pobrać zrzutu z monitor_capture:', shot);
  }

  console.log('3. Usuwam tymczasowe źródło...');
  await sendReq('RemoveInput', { inputName: tempInputName });
  console.log('Gotowe.');

  ws.close();
}

main().catch(console.error);
