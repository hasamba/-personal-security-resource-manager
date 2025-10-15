import Database from 'better-sqlite3';
import type { Bookmark, NewBookmark, UpdateBookmark } from '../types/index.js';

export class BookmarksDAL {
  constructor(private db: Database.Database) {}

  create(bookmark: NewBookmark): Bookmark {
    const stmt = this.db.prepare(`
      INSERT INTO bookmarks (title, url, description)
      VALUES (@title, @url, @description)
    `);
    
    const info = stmt.run({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description ?? null
    });
    
    return this.getById(info.lastInsertRowid as number)!;
  }

  getById(id: number): Bookmark | null {
    const stmt = this.db.prepare('SELECT * FROM bookmarks WHERE id = ?');
    const result = stmt.get(id) as Bookmark | undefined;
    return result ?? null;
  }

  getAll(limit?: number, offset?: number): Bookmark[] {
    let sql = 'SELECT * FROM bookmarks ORDER BY created_at DESC';
    
    if (limit !== undefined) {
      sql += ` LIMIT ${limit}`;
      if (offset !== undefined) {
        sql += ` OFFSET ${offset}`;
      }
    }
    
    const stmt = this.db.prepare(sql);
    return stmt.all() as Bookmark[];
  }

  update(id: number, updates: UpdateBookmark): Bookmark | null {
    const fields: string[] = [];
    const params: Record<string, unknown> = { id };

    if (updates.title !== undefined) {
      fields.push('title = @title');
      params.title = updates.title;
    }
    if (updates.url !== undefined) {
      fields.push('url = @url');
      params.url = updates.url;
    }
    if (updates.description !== undefined) {
      fields.push('description = @description');
      params.description = updates.description;
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push("updated_at = datetime('now')");

    const sql = `UPDATE bookmarks SET ${fields.join(', ')} WHERE id = @id`;
    const stmt = this.db.prepare(sql);
    stmt.run(params);

    return this.getById(id);
  }

  delete(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM bookmarks WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }

  addCategory(bookmarkId: number, categoryId: number): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO bookmark_categories (bookmark_id, category_id)
      VALUES (?, ?)
    `);
    stmt.run(bookmarkId, categoryId);
  }

  removeCategory(bookmarkId: number, categoryId: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM bookmark_categories
      WHERE bookmark_id = ? AND category_id = ?
    `);
    stmt.run(bookmarkId, categoryId);
  }

  getCategories(bookmarkId: number): number[] {
    const stmt = this.db.prepare(`
      SELECT category_id FROM bookmark_categories
      WHERE bookmark_id = ?
    `);
    const rows = stmt.all(bookmarkId) as { category_id: number }[];
    return rows.map(row => row.category_id);
  }

  addTag(bookmarkId: number, tagId: number): void {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id)
      VALUES (?, ?)
    `);
    stmt.run(bookmarkId, tagId);
  }

  removeTag(bookmarkId: number, tagId: number): void {
    const stmt = this.db.prepare(`
      DELETE FROM bookmark_tags
      WHERE bookmark_id = ? AND tag_id = ?
    `);
    stmt.run(bookmarkId, tagId);
  }

  getTags(bookmarkId: number): number[] {
    const stmt = this.db.prepare(`
      SELECT tag_id FROM bookmark_tags
      WHERE bookmark_id = ?
    `);
    const rows = stmt.all(bookmarkId) as { tag_id: number }[];
    return rows.map(row => row.tag_id);
  }

  getByCategory(categoryId: number): Bookmark[] {
    const stmt = this.db.prepare(`
      SELECT b.* FROM bookmarks b
      INNER JOIN bookmark_categories bc ON b.id = bc.bookmark_id
      WHERE bc.category_id = ?
      ORDER BY b.created_at DESC
    `);
    return stmt.all(categoryId) as Bookmark[];
  }

  getByTag(tagId: number): Bookmark[] {
    const stmt = this.db.prepare(`
      SELECT b.* FROM bookmarks b
      INNER JOIN bookmark_tags bt ON b.id = bt.bookmark_id
      WHERE bt.tag_id = ?
      ORDER BY b.created_at DESC
    `);
    return stmt.all(tagId) as Bookmark[];
  }
}
