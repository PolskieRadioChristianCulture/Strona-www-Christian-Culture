import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });

console.log('=== WORKFLOW_RUNS COLS ===');
const runCols = db.prepare('PRAGMA table_info(workflow_runs)').all();
console.log(runCols.map(c => c.name));

console.log('=== WORKFLOW_RUNS (LAST 10) ===');
const runs = db.prepare('SELECT * FROM workflow_runs ORDER BY rowid DESC LIMIT 10').all();
for (const r of runs) {
  console.log(`Run #${r.number} | ID: ${r.run_id} | Trigger: ${r.trigger_node_id} | Scheduled: ${r.scheduled_for}`);
}

console.log('=== WORKFLOW_STEPS COLS ===');
const stepCols = db.prepare('PRAGMA table_info(workflow_steps)').all();
console.log(stepCols.map(c => c.name));

console.log('=== WORKFLOW_STEPS (LAST 25) ===');
const steps = db.prepare('SELECT * FROM workflow_steps ORDER BY rowid DESC LIMIT 25').all();
for (const s of steps) {
  console.log(`Step ${s.step_id} | Run: ${s.run_id} | Node: ${s.node_id} | State: ${s.state} | Error: ${s.error || 'none'}`);
  if (s.output_json) {
    console.log(`   Output: ${s.output_json.slice(0, 180)}`);
  }
}
