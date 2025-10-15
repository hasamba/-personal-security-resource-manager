import Database from 'better-sqlite3';
import type { Note, NewNote, UpdateNote } from '../types/index.js';

export class NotesDAL {
  constructor(private db: Database.Database) {}

  create(note: NewNote): Note {
    const stmt = this.db.prepare(`
      INSERT INTO notes (bookmark_id, content)
      VALUES (@bookmark_id, @content)
    `);
    
    const info = stmt.run({
      bookmark_id: note.bookmark_id,
      content: note.content
    });
    
    return this.getById(info.lastInsertRowid as number)!;
  }

  getById(id: number): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?');
    const result = stmt.get(id) as Note | undefined;
    return result ?? null;
  }

  getByBookmarkId(bookmarkId: number): Note[] {
    const stmt = this.db.prepare(`
      SELECT * FROM notes
      WHERE bookmark_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(bookmarkId) as Note[];
  }

  getAll(limit?: number, offset?: number): Note[] {
    let sql = 'SELECT * FROM notes ORDER BY created_at DESC';
    
    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }
    
    const stmt = this.db.prepare(sql);
    return stmt.all() as Note[];
  }

  update(id: number, updates: UpdateNote): Note | null {
    if (updates.content === undefined) {
      return this.getById(id);
    }

    const stmt = this.db.prepare(`
      UPDATE notes
      SET content = @content, updated_at = datetime('now')
      WHERE id = @id
    `);
    
    stmt.run({
      id,
      content: updates.content
    });

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}
