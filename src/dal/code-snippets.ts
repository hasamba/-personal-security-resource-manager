import Database from 'better-sqlite3';
import type { CodeSnippet, NewCodeSnippet, UpdateCodeSnippet } from '../types/index.js';

export class CodeSnippetsDAL {
  constructor(private db: Database.Database) {}

  create(snippet: NewCodeSnippet): CodeSnippet {
    const stmt = this.db.prepare(`
      INSERT INTO code_snippets (bookmark_id, language, code, description)
      VALUES (@bookmark_id, @language, @code, @description)
    `);
    
    const info = stmt.run({
      bookmark_id: snippet.bookmark_id,
      language: snippet.language,
      code: snippet.code,
      description: snippet.description ?? null
    });
    
    return this.getById(info.lastInsertRowid as number)!;
  }

  getById(id: number): CodeSnippet | null {
    const stmt = this.db.prepare('SELECT * FROM code_snippets WHERE id = ?');
    const result = stmt.get(id) as CodeSnippet | undefined;
    return result ?? null;
  }

  getByBookmarkId(bookmarkId: number): CodeSnippet[] {
    const stmt = this.db.prepare(`
      SELECT * FROM code_snippets
      WHERE bookmark_id = ?
      ORDER BY created_at DESC
    `);
    return stmt.all(bookmarkId) as CodeSnippet[];
  }

  getAll(limit?: number, offset?: number): CodeSnippet[] {
    let sql = 'SELECT * FROM code_snippets ORDER BY created_at DESC';
    
    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }
    
    const stmt = this.db.prepare(sql);
    return stmt.all() as CodeSnippet[];
  }

  update(id: number, updates: UpdateCodeSnippet): CodeSnippet | null {
    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (updates.language !== undefined) {
      fields.push('language = @language');
      params.language = updates.language;
    }
    if (updates.code !== undefined) {
      fields.push('code = @code');
      params.code = updates.code;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    const sql = `UPDATE code_snippets SET ${fields.join(', ')} WHERE id = @id`;
    const stmt = this.db.prepare(sql);
    stmt.run(params);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM code_snippets WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}
