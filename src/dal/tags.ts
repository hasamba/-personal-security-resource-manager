import Database from 'better-sqlite3';
import type { Tag, NewTag } from '../types/index.js';

export class TagsDAL {
  constructor(private db: Database.Database) {}

  create(tag: NewTag): Tag {
    const stmt = this.db.prepare(`
      INSERT INTO tags (name, color)
      VALUES (@name, @color)
    `);
    
    const info = stmt.run({
      name: tag.name,
      color: tag.color ?? null
    });
    
    return this.getById(info.lastInsertRowid as number)!;
  }

  getById(id: number): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE id = ?');
    const result = stmt.get(id) as Tag | undefined;
    return result ?? null;
  }

  getByName(name: string): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ?');
    const result = stmt.get(name) as Tag | undefined;
    return result ?? null;
  }

  getAll(): Tag[] {
    const stmt = this.db.prepare('SELECT * FROM tags ORDER BY name');
    return stmt.all() as Tag[];
  }

  update(id: number, updates: Partial<NewTag>): Tag | null {
    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.color !== undefined) {
      fields.push('color = @color');
      params.color = updates.color;
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    const sql = `UPDATE tags SET ${fields.join(', ')} WHERE id = @id`;
    const stmt = this.db.prepare(sql);
    stmt.run(params);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM tags WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}
