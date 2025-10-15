import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('NotesDAL', () => {
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
    it('should create a new note', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const note = dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'This is a test note'
      });

      expect(note.id).toBeDefined();
      expect(note.bookmark_id).toBe(bookmark.id);
      expect(note.content).toBe('This is a test note');
      expect(note.created_at).toBeDefined();
      expect(note.updated_at).toBeDefined();
    });
  });

  describe('getById', () => {
    it('should retrieve a note by id', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const created = dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Test note'
      });

      const retrieved = dal.notes.getById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent note', () => {
      const note = dal.notes.getById(999);
      expect(note).toBeNull();
    });
  });

  describe('getByBookmarkId', () => {
    it('should retrieve all notes for a bookmark', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      dal.notes.create({ bookmark_id: bookmark.id, content: 'Note 1' });
      dal.notes.create({ bookmark_id: bookmark.id, content: 'Note 2' });
      dal.notes.create({ bookmark_id: bookmark.id, content: 'Note 3' });

      const notes = dal.notes.getByBookmarkId(bookmark.id);

      expect(notes).toHaveLength(3);
      expect(notes.every(n => n.bookmark_id === bookmark.id)).toBe(true);
    });

    it('should return empty array for bookmark with no notes', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const notes = dal.notes.getByBookmarkId(bookmark.id);
      expect(notes).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update note content', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const note = dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Original content'
      });

      const updated = dal.notes.update(note.id, {
        content: 'Updated content'
      });

      expect(updated?.content).toBe('Updated content');
      expect(updated?.bookmark_id).toBe(bookmark.id);
    });

    it('should return null for non-existent note', () => {
      const updated = dal.notes.update(999, { content: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a note', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const note = dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Test note'
      });

      const deleted = dal.notes.delete(note.id);
      expect(deleted).toBe(true);

      const retrieved = dal.notes.getById(note.id);
      expect(retrieved).toBeNull();
    });

    it('should cascade delete when bookmark is deleted', () => {
      const bookmark = dal.bookmarks.create({
        title: 'Test Bookmark',
        url: 'https://example.com'
      });

      const note = dal.notes.create({
        bookmark_id: bookmark.id,
        content: 'Test note'
      });

      dal.bookmarks.delete(bookmark.id);

      const retrieved = dal.notes.getById(note.id);
      expect(retrieved).toBeNull();
    });
  });
});
