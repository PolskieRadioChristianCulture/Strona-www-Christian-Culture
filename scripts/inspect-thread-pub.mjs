import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });
const cols = db.prepare('PRAGMA table_info(projection_thread_messages)').all();
console.log('Cols:', cols.map(c => c.name));

const msgs = db.prepare("SELECT * FROM projection_thread_messages WHERE thread_id = 'openbot-thread-agent-pub10000-7777-4000-8000-000000000005' ORDER BY rowid DESC LIMIT 2").all();
console.log('Last msgs:', JSON.stringify(msgs, null, 2));
