import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE '%connection%' OR name LIKE '%link%' OR name LIKE '%messag%' OR name LIKE '%what%')").all();
console.log('Tables:', tables.map(t => t.name));

for (const t of tables) {
  try {
    const rows = db.prepare('SELECT * FROM ' + t.name).all();
    console.log(`=== ${t.name} (${rows.length}) ===`);
    console.log(JSON.stringify(rows, null, 2).slice(0, 1000));
  } catch (e) {
    console.log(`Error reading ${t.name}:`, e.message);
  }
}
