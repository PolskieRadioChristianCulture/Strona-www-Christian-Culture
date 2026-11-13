import fs from 'node:fs';

const p = 'C:/Users/czark/Desktop/@ICC/Misja CC/JOMA_SHARED_MEMORY/SKRZYNKA/narzedzia/openbot-automation.mjs';
let code = fs.readFileSync(p, 'utf8');

const targetConst = 'export const PUBLIKATOR_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-pub10000-7777-4000-8000-000000000005";';
const additionConst = `
export const NOEMI_AGENT_ID = "agent-00770077-7777-4000-8000-000000000077";
export const NOEMI_THREAD_ID = "openbot-thread-agent-00770077-7777-4000-8000-000000000077";
export const NOEMI_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-00770077-7777-4000-8000-000000000077";
export const A150_AGENT_ID = "agent-a1500150-7777-4000-8000-000000000150";
export const A150_THREAD_ID = "openbot-thread-agent-a1500150-7777-4000-8000-000000000150";
export const A150_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-a1500150-7777-4000-8000-000000000150";
export const A520_AGENT_ID = "agent-a5200520-7777-4000-8000-000000000520";
export const A520_THREAD_ID = "openbot-thread-agent-a5200520-7777-4000-8000-000000000520";
export const A520_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-a5200520-7777-4000-8000-000000000520";
export const SMCC_AGENT_ID = "agent-smcc0008-7777-4000-8000-000000000008";
export const SMCC_THREAD_ID = "openbot-thread-agent-smcc0008-7777-4000-8000-000000000008";
export const SMCC_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-smcc0008-7777-4000-8000-000000000008";
export const RUT_AGENT_ID = "agent-rut00014-7777-4000-8000-000000000014";
export const RUT_THREAD_ID = "openbot-thread-agent-rut00014-7777-4000-8000-000000000014";
export const RUT_WORKSPACE = "C:\\\\Users\\\\czark\\\\OpenBot\\\\Agents\\\\agent-rut00014-7777-4000-8000-000000000014";`;

if (!code.includes('NOEMI_AGENT_ID')) {
  code = code.replace(targetConst, targetConst + additionConst);
  console.log('Consts added');
}

// Sprawdźmy optimizeCc i rozszerzmy rejestrację agentów
const targetMkdir = 'fs.mkdirSync(PUBLIKATOR_WORKSPACE, { recursive: true });';
const additionMkdir = `
  fs.mkdirSync(NOEMI_WORKSPACE, { recursive: true });
  fs.mkdirSync(A150_WORKSPACE, { recursive: true });
  fs.mkdirSync(A520_WORKSPACE, { recursive: true });
  fs.mkdirSync(SMCC_WORKSPACE, { recursive: true });
  fs.mkdirSync(RUT_WORKSPACE, { recursive: true });`;

if (!code.includes('fs.mkdirSync(NOEMI_WORKSPACE')) {
  code = code.replace(targetMkdir, targetMkdir + additionMkdir);
  console.log('Mkdir added');
}

fs.writeFileSync(p, code, 'utf8');
console.log('openbot-automation.mjs patch part 1 done');
