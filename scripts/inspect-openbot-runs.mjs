import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';

const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db', { readOnly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

for (const t of tables) {
  const name = t.name;
  if (name.includes('run') || name.includes('exec') || name.includes('history') || name.includes('log') || name.includes('error') || name.includes('event')) {
    try {
      const count = db.prepare(`SELECT COUNT(*) as c FROM "${name}"`).get();
      console.log(`Table ${name}: ${count.c} rows`);
      if (count.c > 0) {
        const sample = db.prepare(`SELECT * FROM "${name}" ORDER BY rowid DESC LIMIT 3`).all();
        console.log(`Sample from ${name}:`, JSON.stringify(sample, null, 2).slice(0, 500));
      }
    } catch (e) {
      console.log(`Table ${name} query error:`, e.message);
    }
  }
}
