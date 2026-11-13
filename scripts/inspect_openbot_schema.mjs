import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db');

const cols = db.prepare("PRAGMA table_info(workflow_nodes)").all();
console.log('workflow_nodes cols:', cols.map(c => c.name));

const sample = db.prepare("SELECT * FROM workflow_nodes LIMIT 2").all();
console.log('sample node:', JSON.stringify(sample, null, 2));

const triggers = db.prepare("SELECT * FROM workflow_triggers").all();
console.log('triggers:', JSON.stringify(triggers, null, 2));
