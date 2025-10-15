import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('BookmarksDAL', () => {
  let db: Database.Database;
  let dal: DatabaseAccessLayer;

  beforeEach(() => {
    db = initializeDatabase(':memory:');
    dal = new DatabaseAccessLayer(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('create', () => {
    it('should create a new bookmark', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description'
      });

      expect(bookmark.id).toBeDefined();
      expect(bookmark.title).toBe('Test Bookmark');
      expect(bookmark.url).toBe('https://example.com');
      expect(bookmark.description).toBe('Test description');
      expect(bookmark.created_at).toBeDefined();
      expect(bookmark.updated_at).toBeDefined();
    });

    it('should create a bookmark without description', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      expect(bookmark.id).toBeDefined();
      expect(bookmark.description).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve a bookmark by id', () => {
      const created = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const retrieved = dal.bookmarks.getById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent bookmark', () => {
      const bookmark = dal.bookmarks.getById(999);
      expect(bookmark).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all bookmarks', () => {
      dal.bookmarks.create({ title: 'Bookmark 1', url: 'https://example1.com' });
      dal.bookmarks.create({ title: 'Bookmark 2', url: 'https://example2.com' });
      dal.bookmarks.create({ title: 'Bookmark 3', url: 'https://example3.com' });

      const bookmarks = dal.bookmarks.getAll();

      expect(bookmarks).toHaveLength(3);
    });

    it('should support pagination', () => {
      for (let i = 0; i < 5; i++) {
        dal.bookmarks.create({ title: `Bookmark ${i}`, url: `https://example${i}.com` });
      }

      const page1 = dal.bookmarks.getAll(2, 0);
      const page2 = dal.bookmarks.getAll(2, 2);

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });

  describe('update', () => {
    it('should update bookmark fields', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Original Title',
        url: 'https://example.com'
      });

      const updated = dal.bookmarks.update(bookmark.id, {
        title: 'Updated Title',
        description: 'New description'
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.description).toBe('New description');
      expect(updated?.url).toBe('https://example.com');
    });

    it('should return null for non-existent bookmark', () => {
      const updated = dal.bookmarks.update(999, { title: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a bookmark', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const deleted = dal.bookmarks.delete(bookmark.id);
      expect(deleted).toBe(true);

      const retrieved = dal.bookmarks.getById(bookmark.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent bookmark', () => {
      const deleted = dal.bookmarks.delete(999);
      expect(deleted).toBe(false);
    });
  });

  describe('categories', () => {
    it('should add and retrieve categories', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });
      const category = dal.categories.create({ name: 'Test Category' });

      dal.bookmarks.addCategory(bookmark.id, category.id);
      const categories = dal.bookmarks.getCategories(bookmark.id);

      expect(categories).toContain(category.id);
    });

    it('should remove categories', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });
      const category = dal.categories.create({ name: 'Test Category' });

      dal.bookmarks.addCategory(bookmark.id, category.id);
      dal.bookmarks.removeCategory(bookmark.id, category.id);
      const categories = dal.bookmarks.getCategories(bookmark.id);

      expect(categories).not.toContain(category.id);
    });

    it('should get bookmarks by category', () => {
      const category = dal.categories.create({ name: 'Test Category' });
      const bookmark1 = dal.bookmarks.create({ title: 'Bookmark 1', url: 'https://example1.com' });
      const bookmark2 = dal.bookmarks.create({ title: 'Bookmark 2', url: 'https://example2.com' });

      dal.bookmarks.addCategory(bookmark1.id, category.id);
      dal.bookmarks.addCategory(bookmark2.id, category.id);

      const bookmarks = dal.bookmarks.getByCategory(category.id);

      expect(bookmarks).toHaveLength(2);
      expect(bookmarks.map(b => b.id)).toContain(bookmark1.id);
      expect(bookmarks.map(b => b.id)).toContain(bookmark2.id);
    });
  });

  describe('tags', () => {
    it('should add and retrieve tags', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });
      const tag = dal.tags.create({ name: 'test-tag' });

      dal.bookmarks.addTag(bookmark.id, tag.id);
      const tags = dal.bookmarks.getTags(bookmark.id);

      expect(tags).toContain(tag.id);
    });

    it('should remove tags', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });
      const tag = dal.tags.create({ name: 'test-tag' });

      dal.bookmarks.addTag(bookmark.id, tag.id);
      dal.bookmarks.removeTag(bookmark.id, tag.id);
      const tags = dal.bookmarks.getTags(bookmark.id);

      expect(tags).not.toContain(tag.id);
    });

    it('should get bookmarks by tag', () => {
      const tag = dal.tags.create({ name: 'test-tag' });
      const bookmark1 = dal.bookmarks.create({ title: 'Bookmark 1', url: 'https://example1.com' });
      const bookmark2 = dal.bookmarks.create({ title: 'Bookmark 2', url: 'https://example2.com' });

      dal.bookmarks.addTag(bookmark1.id, tag.id);
      dal.bookmarks.addTag(bookmark2.id, tag.id);

      const bookmarks = dal.bookmarks.getByTag(tag.id);

      expect(bookmarks).toHaveLength(2);
      expect(bookmarks.map(b => b.id)).toContain(bookmark1.id);
      expect(bookmarks.map(b => b.id)).toContain(bookmark2.id);
    });
  });
});
