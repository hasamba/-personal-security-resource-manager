import Database from 'better-sqlite3';
import { runMigrations } from './migrations.js';

export function createDatabase(path: string = 'bookmarks.db', options?: Database.Options): Database.Database {
  const db = new Database(path, options);
  
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  return db;
}

export function initializeDatabase(path: string = 'bookmarks.db', options?: Database.Options): Database.Database {
  const db = createDatabase(path, options);
  runMigrations(db);
  return db;
}
