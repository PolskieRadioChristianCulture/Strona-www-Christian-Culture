import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db');

console.log('--- WORKFLOW NODES ---');
const nodes = db.prepare("SELECT workflow_id, node_id, kind, label FROM workflow_nodes").all();
console.log(JSON.stringify(nodes, null, 2));

console.log('--- WORKFLOW TRIGGERS ---');
const triggers = db.prepare("SELECT * FROM workflow_triggers").all();
console.log(JSON.stringify(triggers, null, 2));
