import Database from 'better-sqlite3';
import type { Category, NewCategory } from '../types/index.js';

export class CategoriesDAL {
  constructor(private db: Database.Database) {}

  create(category: NewCategory): Category {
    const stmt = this.db.prepare(`
      INSERT INTO categories (name, description, is_predefined)
      VALUES (@name, @description, @is_predefined)
    `);
    
    const info = stmt.run({
      name: category.name,
      description: category.description ?? null,
      is_predefined: category.is_predefined ? 1 : 0
    });
    
    return this.getById(info.lastInsertRowid as number)!;
  }

  getById(id: number): Category | null {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE id = ?');
    const result = stmt.get(id) as Category | undefined;
    return result ?? null;
  }

  getByName(name: string): Category | null {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE name = ?');
    const result = stmt.get(name) as Category | undefined;
    return result ?? null;
  }

  getAll(): Category[] {
    const stmt = this.db.prepare('SELECT * FROM categories ORDER BY name');
    return stmt.all() as Category[];
  }

  getPredefined(): Category[] {
    const stmt = this.db.prepare('SELECT * FROM categories WHERE is_predefined = 1 ORDER BY name');
    return stmt.all() as Category[];
  }

  update(id: number, updates: Partial<NewCategory>): Category | null {
    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (updates.name !== undefined) {
      fields.push('name = @name');
      params.name = updates.name;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = @id`;
    const stmt = this.db.prepare(sql);
    stmt.run(params);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM categories WHERE id = ? AND is_predefined = 0');
    const info = stmt.run(id);
    return info.changes > 0;
  }
}
