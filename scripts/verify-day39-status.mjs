import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

async function check() {
  const saCuda = JSON.parse(fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/cudaServiceAccountKey.json'));
  const appCuda = initializeApp({ credential: cert(saCuda) }, 'cuda-check');
  const dbCuda = getFirestore(appCuda);
  const docCuda = await dbCuda.collection('reflections').doc('ref_day39_2026-11-08').get();
  console.log('CUDA exists:', docCuda.exists);
  if (docCuda.exists) {
    const d = docCuda.data();
    console.log('CUDA Title:', d.title);
    console.log('CUDA Date:', d.date);
    console.log('CUDA DayOfWeek:', d.dayOfWeek);
  }

  const saMC = JSON.parse(fs.readFileSync('C:/Users/czark/Christian_Culture_Projekty/Wektor1_VideoFactory/serviceAccountKey.json'));
  const appMC = initializeApp({ credential: cert(saMC) }, 'mc-check');
  const dbMC = getFirestore(appMC);
  const docMCMorning = await dbMC.collection('morning_inspirations').doc('insp_day39_2026-11-08').get();
  console.log('MC Morning exists:', docMCMorning.exists);
  const docMCWeb = await dbMC.collection('web_inspirations').doc('insp_day39_2026-11-08').get();
  console.log('MC Web exists:', docMCWeb.exists);

  const snap = await dbMC.collection('CommandQueue')
    .where('dayNumber', '==', 39)
    .get();
  console.log('CommandQueue Day 39 count:', snap.size);
  snap.forEach(d => {
    const data = d.data();
    console.log(` - Doc: ${d.id} | status: ${data.status} | type: ${data.type} | target: ${data.targetGroup || data.recipient || 'N/A'}`);
  });
}
check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
