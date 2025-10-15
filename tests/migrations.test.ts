import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDatabase } from '../src/utils/database.js';
import { runMigrations, getAppliedMigrations, getMigrationFiles } from '../src/utils/migrations.js';
import type Database from 'better-sqlite3';

describe('Migrations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('should run all migrations', () => {
    runMigrations(db);

    const appliedMigrations = getAppliedMigrations(db);
    const migrationFiles = getMigrationFiles();

    expect(appliedMigrations.length).toBe(migrationFiles.length);
  });

  it('should create migrations table', () => {
    runMigrations(db);

    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='migrations'");
    const result = stmt.get();

    expect(result).toBeDefined();
  });

  it('should create all required tables', () => {
    runMigrations(db);

    const tables = [
      'bookmarks',
      'categories',
      'tags',
      'notes',
      'code_snippets',
      'bookmark_categories',
      'bookmark_tags'
    ];

    for (const table of tables) {
      const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`);
      const result = stmt.get(table);
      expect(result).toBeDefined();
    }
  });

  it('should create FTS5 virtual tables', () => {
    runMigrations(db);

    const ftsTables = ['bookmarks_fts', 'notes_fts', 'code_snippets_fts'];

    for (const table of ftsTables) {
      const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`);
      const result = stmt.get(table);
      expect(result).toBeDefined();
    }
  });

  it('should not run migrations twice', () => {
    runMigrations(db);
    const firstRun = getAppliedMigrations(db);

    runMigrations(db);
    const secondRun = getAppliedMigrations(db);

    expect(firstRun).toEqual(secondRun);
  });

  it('should seed predefined categories', () => {
    runMigrations(db);

    const stmt = db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_predefined = 1');
    const result = stmt.get() as { count: number };

    expect(result.count).toBeGreaterThan(0);
  });

  it('should enforce foreign key constraints', () => {
    runMigrations(db);

    const stmt = db.prepare('PRAGMA foreign_keys');
    const result = stmt.get() as { foreign_keys: number };

    expect(result.foreign_keys).toBe(1);
  });
});
