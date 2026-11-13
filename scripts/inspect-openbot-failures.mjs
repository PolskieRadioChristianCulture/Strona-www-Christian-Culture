import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db');
const cols = db.prepare('PRAGMA table_info(projection_deliveries)').all();
console.log('projection_deliveries cols:', cols.map(c => c.name));

const details = db.prepare("SELECT * FROM projection_deliveries WHERE status = 'failed' LIMIT 5").all();
console.log('Failed deliveries sample:', details);
