import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

async function main() {
  await obs.connect('ws://192.168.50.217:4455', '6qPcL0sXrVvs6sPN');
  console.log('Connected to OBS WebSocket');

  const streamStatus = await obs.call('GetStreamStatus');
  console.log('Main stream status:', streamStatus);

  // Check Aitum outputs
  const aitumOutputs = ['Biblia Audio', 'Werset Dnia', 'RCC', 'CC MEN', 'CC Women', 'CC TV'];
  for (const name of aitumOutputs) {
    try {
      const res = await obs.call('GetOutputStatus', { outputName: name });
      console.log(`Output "${name}":`, res.outputActive ? 'ACTIVE' : 'INACTIVE');
    } catch (e) {
      console.log(`Output "${name}": Error/Not standard output (${e.message})`);
    }
  }

  await obs.disconnect();
}

main().catch(console.error);
