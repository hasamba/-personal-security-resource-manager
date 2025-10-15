import { initializeDatabase } from '../src/utils/database.js';

const dbPath = process.argv[2] || 'bookmarks.db';

console.log(`Initializing database at: ${dbPath}`);
const db = initializeDatabase(dbPath);
console.log('Database initialized successfully');
db.close();
