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

  console.log('--- DIAGNOSTYKA OBS ---');

  // 1. Sprawdź aktualną scenę
  const currentScene = await sendReq('GetCurrentProgramScene');
  console.log('Aktualna scena główna:', currentScene.responseData?.currentProgramSceneName);

  // 2. Lista wszystkich scen
  const sceneList = await sendReq('GetSceneList');
  console.log('Wszystkie sceny:', sceneList.responseData?.scenes?.map(s => s.sceneName));

  // 3. Sprawdź listę elementów na obecnej scenie
  const sceneItems = await sendReq('GetSceneItemList', { sceneName: currentScene.responseData?.currentProgramSceneName });
  console.log('Elementy na scenie:', JSON.stringify(sceneItems.responseData?.sceneItems?.map(i => ({
    id: i.sceneItemId,
    name: i.sourceName,
    type: i.inputKind || i.sourceType,
    enabled: i.sceneItemEnabled
  })), null, 2));

  // 4. Pobierz screenshot aktualnej sceny
  const artDir = 'C:/Users/czark/.gemini/antigravity/brain/efe2b5a3-471d-49c7-bfc1-2def07e07138';
  const scShot = await sendReq('GetSourceScreenshot', {
    sourceName: currentScene.responseData?.currentProgramSceneName,
    imageFormat: 'png',
    imageWidth: 1920,
    imageHeight: 1080
  });

  if (scShot.responseData?.imageData) {
    const b64 = scShot.responseData.imageData.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(`${artDir}/obs_current_scene.png`, Buffer.from(b64, 'base64'));
    console.log('Zapisano zrzut obecnej sceny:', `${artDir}/obs_current_scene.png`);
  }

  // 5. Sprawdź ustawienia wszystkich wejść na scenie
  for (const item of sceneItems.responseData?.sceneItems || []) {
    try {
      const st = await sendReq('GetInputSettings', { inputName: item.sourceName });
      console.log(`\nUstawienia źródła [${item.sourceName}]:`, JSON.stringify(st.responseData?.inputSettings, null, 2));
    } catch (e) {
      // Niektóre to mogą być sceny podrzędne
    }
  }

  // 6. Sprawdź status streamu
  const streamStatus = await sendReq('GetStreamStatus');
  console.log('\nStatus nadawania:', streamStatus.responseData);

  ws.close();
}

main().catch(console.error);
