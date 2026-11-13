import { DatabaseSync } from 'node:sqlite';

const dbPath = 'C:/Users/czark/AppData/Local/Temp/wa-link-copy.db';
const db = new DatabaseSync(dbPath, { readOnly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in copied WhatsApp link db:', tables.map(t => t.name));

for (const t of tables) {
  try {
    const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get();
    console.log(`Table ${t.name}: ${count.c} rows`);
    if (count.c > 0) {
      const rows = db.prepare(`SELECT * FROM "${t.name}" LIMIT 2`).all();
      console.log(`  Sample:`, rows);
    }
  } catch (e) {
    console.log(`Error reading ${t.name}:`, e.message);
  }
}
