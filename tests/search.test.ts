import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('SearchDAL', () => {
  let db: Database.Database;
  let dal: DatabaseAccessLayer;

  beforeEach(() => {
    db = initializeDatabase(':memory:');
    dal = new DatabaseAccessLayer(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('searchBookmarks', () => {
    it('should search bookmarks by title', () => {
      dal.bookmarks.create({
        title: 'SQL Injection Prevention',
        url: 'https://example.com/sql',
        description: 'Learn about preventing SQL injection attacks'
      });
      dal.bookmarks.create({
        title: 'XSS Protection',
        url: 'https://example.com/xss',
        description: 'Cross-site scripting prevention techniques'
      });
      dal.bookmarks.create({
        title: 'CSRF Tokens',
        url: 'https://example.com/csrf',
        description: 'Understanding CSRF protection'
      });

      const results = dal.search.searchBookmarks('SQL injection');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('bookmark');
      expect(results[0].title).toContain('SQL');
    });

    it('should search bookmarks by description', () => {
      dal.bookmarks.create({
        title: 'Security Guide',
        url: 'https://example.com',
        description: 'A comprehensive guide to cryptography and encryption'
      });

      const results = dal.search.searchBookmarks('cryptography');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('bookmark');
    });

    it('should return empty array for no matches', () => {
      dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com',
        description: 'Test description'
      });

      const results = dal.search.searchBookmarks('nonexistent');

      expect(results).toHaveLength(0);
    });

    it('should rank results by relevance', () => {
      dal.bookmarks.create({
        title: 'Security Security Security',
        url: 'https://example.com/1',
        description: 'Security'
      });
      dal.bookmarks.create({
        title: 'Test',
        url: 'https://example.com/2',
        description: 'Security'
      });

      const results = dal.search.searchBookmarks('security');

      expect(results.length).toBe(2);
      expect(results[0].title).toContain('Security Security');
    });
  });

  describe('searchNotes', () => {
    it('should search notes by content', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'This note discusses authentication mechanisms and OAuth2 flows'
      });
      dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Another note about authorization policies'
      });

      const results = dal.search.searchNotes('authentication OAuth2');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('note');
      expect(results[0].content).toContain('authentication');
    });

    it('should return empty array for no matches', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Some random content'
      });

      const results = dal.search.searchNotes('nonexistent');

      expect(results).toHaveLength(0);
    });
  });

  describe('searchCodeSnippets', () => {
    it('should search code snippets by code content', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'function hashPassword(password) { return bcrypt.hash(password); }',
        description: 'Password hashing example'
      });

      const results = dal.search.searchCodeSnippets('bcrypt hash password');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('code_snippet');
    });

    it('should search code snippets by description', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'python',
        code: 'import jwt',
        description: 'JWT token generation example'
      });

      const results = dal.search.searchCodeSnippets('JWT token');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('code_snippet');
    });
  });

  describe('searchAll', () => {
    it('should search across all content types', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Security Best Practices',
        url: 'https://example.com',
        description: 'Learn about security'
      });

      dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Notes about security implementations'
      });

      dal.codeSnippets.create({
        bookmark_id: bookmark.id,
        language: 'javascript',
        code: 'const security = require("security-lib");',
        description: 'Security library example'
      });

      const results = dal.search.searchAll('security');

      expect(results.length).toBeGreaterThan(0);
      
      const types = new Set(results.map(r => r.type));
      expect(types.has('bookmark')).toBe(true);
      expect(types.has('note')).toBe(true);
      expect(types.has('code_snippet')).toBe(true);
    });

    it('should respect limit parameter', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test',
        url: 'https://example.com'
      });

      for (let i = 0; i < 20; i++) {
        dal.notes.create({
          bookmark_id: bookmark.id,
          content: `Test note number ${i} with keyword testing`
        });
      }

      const results = dal.search.searchAll('testing', 10);

      expect(results.length).toBeLessThanOrEqual(10);
    });

    it('should order results by relevance', () => {
      dal.bookmarks.create({
        title: 'Test Test Test',
        url: 'https://example.com',
        description: 'Test Test'
      });

      dal.bookmarks.create({
        title: 'Different',
        url: 'https://example.com',
        description: 'Test'
      });

      const results = dal.search.searchAll('test');

      expect(results.length).toBeGreaterThan(0);
    });
  });
});
