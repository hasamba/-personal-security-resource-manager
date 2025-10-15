import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('TagsDAL', () => {
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
    it('should create a new tag', () => {
      const tag = dal.tags.create({
        name: 'security',
        color: '#FF5733'
      });

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('security');
      expect(tag.color).toBe('#FF5733');
    });

    it('should create a tag without color', () => {
      const tag = dal.tags.create({
        name: 'javascript'
      });

      expect(tag.id).toBeDefined();
      expect(tag.color).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve a tag by id', () => {
      const created = dal.tags.create({ name: 'test-tag' });
      const retrieved = dal.tags.getById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent tag', () => {
      const tag = dal.tags.getById(999);
      expect(tag).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should retrieve a tag by name', () => {
      const created = dal.tags.create({ name: 'test-tag' });
      const retrieved = dal.tags.getByName('test-tag');

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent tag name', () => {
      const tag = dal.tags.getByName('non-existent');
      expect(tag).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all tags', () => {
      dal.tags.create({ name: 'tag1' });
      dal.tags.create({ name: 'tag2' });
      dal.tags.create({ name: 'tag3' });

      const tags = dal.tags.getAll();

      expect(tags).toHaveLength(3);
    });

    it('should return tags in alphabetical order', () => {
      dal.tags.create({ name: 'zebra' });
      dal.tags.create({ name: 'alpha' });
      dal.tags.create({ name: 'beta' });

      const tags = dal.tags.getAll();

      expect(tags[0].name).toBe('alpha');
      expect(tags[1].name).toBe('beta');
      expect(tags[2].name).toBe('zebra');
    });
  });

  describe('update', () => {
    it('should update tag fields', () => {
      const tag = dal.tags.create({
        name: 'original-name',
        color: '#000000'
      });

      const updated = dal.tags.update(tag.id, {
        name: 'updated-name',
        color: '#FFFFFF'
      });

      expect(updated?.name).toBe('updated-name');
      expect(updated?.color).toBe('#FFFFFF');
    });

    it('should return null for non-existent tag', () => {
      const updated = dal.tags.update(999, { name: 'test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a tag', () => {
      const tag = dal.tags.create({ name: 'deletable' });
      const deleted = dal.tags.delete(tag.id);

      expect(deleted).toBe(true);
      const retrieved = dal.tags.getById(tag.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent tag', () => {
      const deleted = dal.tags.delete(999);
      expect(deleted).toBe(false);
    });
  });
});
