import Database from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface Migration {
  id: number;
  name: string;
  applied_at: string;
}

export function getMigrationsDir(): string {
  return join(__dirname, '..', 'migrations');
}

export function initMigrationTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function getAppliedMigrations(db: Database.Database): number[] {
  const stmt = db.prepare('SELECT id FROM migrations ORDER BY id');
  const rows = stmt.all() as Migration[];
  return rows.map(row => row.id);
}

export function getMigrationFiles(): { id: number; name: string; path: string }[] {
  const migrationsDir = getMigrationsDir();
  const files = readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  return files.map(file => {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    if (!match) {
      throw new Error(`Invalid migration filename: ${file}`);
    }
    return {
      id: parseInt(match[1], 10),
      name: match[2],
      path: join(migrationsDir, file)
    };
  });
}

export function runMigrations(db: Database.Database): void {
  initMigrationTable(db);
  
  const appliedMigrations = getAppliedMigrations(db);
  const migrationFiles = getMigrationFiles();
  
  const pendingMigrations = migrationFiles.filter(
    migration => !appliedMigrations.includes(migration.id)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`Running ${pendingMigrations.length} migration(s)...`);
  
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.id}: ${migration.name}`);
    
    const sql = readFileSync(migration.path, 'utf-8');
    
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO migrations (id, name) VALUES (?, ?)').run(
        migration.id,
        migration.name
      );
    })();
    
    console.log(`✓ Migration ${migration.id} applied`);
  }
  
  console.log('All migrations completed');
}
