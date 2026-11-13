import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });

console.log('=== WORKFLOW STEPS WITH ERRORS ===');
const errorSteps = db.prepare("SELECT step_id, run_id, node_id, status, error, input, output FROM workflow_steps WHERE error IS NOT NULL AND error != 'none' AND error != '' ORDER BY rowid DESC LIMIT 15").all();
console.log(JSON.stringify(errorSteps, null, 2));

console.log('=== RUNS WITH STATUS ERROR ===');
const errorRuns = db.prepare("SELECT run_id, number, trigger_node_id, status, error, started_at, ended_at FROM workflow_runs WHERE status != 'completed' AND status IS NOT NULL ORDER BY rowid DESC LIMIT 15").all();
console.log(JSON.stringify(errorRuns, null, 2));
