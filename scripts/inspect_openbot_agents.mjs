import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db');

console.log('--- PROJECTION_AGENTS ---');
const agents = db.prepare("SELECT * FROM projection_agents").all();
console.log(JSON.stringify(agents, null, 2));

console.log('--- WORKFLOWS ---');
const workflows = db.prepare("SELECT * FROM workflows").all();
console.log(JSON.stringify(workflows, null, 2));

console.log('--- ROUTINES ---');
const routines = db.prepare("SELECT * FROM projection_agent_routines").all();
console.log(JSON.stringify(routines, null, 2));
