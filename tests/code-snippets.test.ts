import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('CodeSnippetsDAL', () => {
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
    it('should create a new code snippet', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const snippet = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'console.log("Hello World");',
        description: 'A simple hello world'
      });

      expect(snippet.id).toBeDefined();
      expect(snippet.bookmark_id).toBe(bookmark.id);
      expect(snippet.language).toBe('javascript');
      expect(snippet.code).toBe('console.log("Hello World");');
      expect(snippet.description).toBe('A simple hello world');
      expect(snippet.created_at).toBeDefined();
    });

    it('should create a snippet without description', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const snippet = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'python',
        code: 'print("Hello")'
      });

      expect(snippet.id).toBeDefined();
      expect(snippet.description).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve a snippet by id', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const created = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'typescript',
        code: 'const x: number = 42;'
      });

      const retrieved = dal.codeSnippets.getById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent snippet', () => {
      const snippet = dal.codeSnippets.getById(999);
      expect(snippet).toBeNull();
    });
  });

  describe('getByBookmarkId', () => {
    it('should retrieve all snippets for a bookmark', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'const a = 1;'
      });
      dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'python',
        code: 'a = 1'
      });

      const snippets = dal.codeSnippets.getByBookmarkId(bookmark.id);

      expect(snippets).toHaveLength(2);
      expect(snippets.every(s => s.bookmark_id === bookmark.id)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update snippet fields', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const snippet = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'const x = 1;'
      });

      const updated = dal.codeSnippets.update(snippet.id, {
        language: 'typescript',
        code: 'const x: number = 1;',
        description: 'Typed version'
      });

      expect(updated?.language).toBe('typescript');
      expect(updated?.code).toBe('const x: number = 1;');
      expect(updated?.description).toBe('Typed version');
    });

    it('should return null for non-existent snippet', () => {
      const updated = dal.codeSnippets.update(999, { code: 'test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a snippet', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const snippet = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'console.log("test");'
      });

      const deleted = dal.codeSnippets.delete(snippet.id);
      expect(deleted).toBe(true);

      const retrieved = dal.codeSnippets.getById(snippet.id);
      expect(retrieved).toBeNull();
    });

    it('should cascade delete when bookmark is deleted', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const snippet = dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'test'
      });

      dal.bookmarks.delete(bookmark.id);

      const retrieved = dal.codeSnippets.getById(snippet.id);
      expect(retrieved).toBeNull();
    });
  });
});
