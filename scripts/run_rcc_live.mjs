import { setupAndGoLive } from './setup_channel_live.mjs';

async function main() {
  await setupAndGoLive({
    channelName: 'Polskie Radio CHRISTIAN CULTURE',
    outputName: 'RCC',
    streamTitle: 'Polskie Radio Christian Culture LIVE 🔴 24/7'
  });
}

main().catch(console.error);
