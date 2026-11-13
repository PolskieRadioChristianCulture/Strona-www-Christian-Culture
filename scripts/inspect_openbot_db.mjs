import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('C:/Users/czark/AppData/Roaming/OpenBot/openbot.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in openbot.db:');
console.log(tables.map(t => t.name));
