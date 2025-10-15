import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/utils/database.js';
import { DatabaseAccessLayer } from '../src/dal/index.js';
import type Database from 'better-sqlite3';

describe('CategoriesDAL', () => {
  let db: Database.Database;
  let dal: DatabaseAccessLayer;

  beforeEach(() => {
    db = initializeDatabase(':memory:');
    dal = new DatabaseAccessLayer(db);
  });

  afterEach(() => {
    db.close();
  });

  describe('predefined categories', () => {
    it('should have seeded predefined categories', () => {
      const categories = dal.categories.getPredefined();

      expect(categories.length).toBeGreaterThan(0);
      expect(categories.some(c => c.name === 'Web Security')).toBe(true);
      expect(categories.some(c => c.name === 'Cryptography')).toBe(true);
      expect(categories.some(c => c.name === 'API Security')).toBe(true);
    });

    it('should not allow deletion of predefined categories', () => {
      const predefined = dal.categories.getPredefined()[0];
      const deleted = dal.categories.delete(predefined.id);

      expect(deleted).toBe(false);
      const stillExists = dal.categories.getById(predefined.id);
      expect(stillExists).not.toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new category', () => {
      const category = dal.categories.create({
        name: 'Custom Category',
        description: 'A custom category'
      });

      expect(category.id).toBeDefined();
      expect(category.name).toBe('Custom Category');
      expect(category.description).toBe('A custom category');
      expect(category.is_predefined).toBe(0);
    });

    it('should create a category without description', () => {
      const category = dal.categories.create({
        name: 'Minimal Category'
      });

      expect(category.id).toBeDefined();
      expect(category.description).toBeNull();
    });
  });

  describe('getById', () => {
    it('should retrieve a category by id', () => {
      const created = dal.categories.create({ name: 'Test Category' });
      const retrieved = dal.categories.getById(created.id);

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent category', () => {
      const category = dal.categories.getById(999);
      expect(category).toBeNull();
    });
  });

  describe('getByName', () => {
    it('should retrieve a category by name', () => {
      const created = dal.categories.create({ name: 'Test Category' });
      const retrieved = dal.categories.getByName('Test Category');

      expect(retrieved).toEqual(created);
    });

    it('should return null for non-existent category name', () => {
      const category = dal.categories.getByName('Non-existent');
      expect(category).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should retrieve all categories including predefined', () => {
      dal.categories.create({ name: 'Custom 1' });
      dal.categories.create({ name: 'Custom 2' });

      const categories = dal.categories.getAll();
      const predefinedCount = dal.categories.getPredefined().length;

      expect(categories.length).toBeGreaterThanOrEqual(predefinedCount + 2);
    });
  });

  describe('update', () => {
    it('should update category fields', () => {
      const category = dal.categories.create({
        name: 'Original Name',
        description: 'Original description'
      });

      const updated = dal.categories.update(category.id, {
        name: 'Updated Name',
        description: 'Updated description'
      });

      expect(updated?.name).toBe('Updated Name');
      expect(updated?.description).toBe('Updated description');
    });

    it('should return null for non-existent category', () => {
      const updated = dal.categories.update(999, { name: 'Test' });
      expect(updated).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a custom category', () => {
      const category = dal.categories.create({ name: 'Deletable' });
      const deleted = dal.categories.delete(category.id);

      expect(deleted).toBe(true);
      const retrieved = dal.categories.getById(category.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent category', () => {
      const deleted = dal.categories.delete(999);
      expect(deleted).toBe(false);
    });
  });
});
