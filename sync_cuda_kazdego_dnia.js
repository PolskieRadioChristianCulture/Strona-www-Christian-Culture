import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const cjs = require('./sync_cuda_kazdego_dnia.cjs');

export const syncCudaDaily = cjs.syncCudaDaily;
export default cjs.syncCudaDaily;
