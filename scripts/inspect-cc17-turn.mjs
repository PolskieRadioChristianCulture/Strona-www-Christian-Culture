import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });

const step = db.prepare("SELECT * FROM workflow_steps WHERE node_id = 'lane-cc170017-agent-cc170017-0002-4000-8000-000000000002' ORDER BY rowid DESC LIMIT 1").get();
console.log('CC17 Step:');
console.log('Status:', step?.status);
console.log('Error:', step?.error);
console.log('Turn ID:', step?.turn_id);
if (step?.turn_id) {
  const turn = db.prepare('SELECT * FROM projection_turns WHERE turn_id = ?').get(step.turn_id);
  console.log('Turn details:', turn);
  const msgs = db.prepare('SELECT role, text FROM projection_thread_messages WHERE thread_id = (SELECT thread_id FROM projection_turns WHERE turn_id = ?) ORDER BY rowid DESC LIMIT 4').all(step.turn_id);
  console.log('Thread messages:', msgs);
}
