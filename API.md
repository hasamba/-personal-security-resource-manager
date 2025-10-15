# API Documentation

## Database Initialization

```typescript
import { initializeDatabase, DatabaseAccessLayer } from 'bookmarks-manager';

// Initialize database with migrations
const db = initializeDatabase('bookmarks.db');
const dal = new DatabaseAccessLayer(db);

// Create database without running migrations
import { createDatabase } from 'bookmarks-manager';
const db = createDatabase('bookmarks.db');
```

## Bookmarks API

### BookmarksDAL

```typescript
// Create a bookmark
const bookmark = dal.bookmarks.create({
  title: 'Example',
  url: 'https://example.com',
  description: 'Optional description'
});

// Get bookmark by ID
const bookmark = dal.bookmarks.getById(1);

// Get all bookmarks with optional pagination
const bookmarks = dal.bookmarks.getAll();
const page = dal.bookmarks.getAll(10, 20); // limit 10, offset 20

// Update bookmark
const updated = dal.bookmarks.update(1, {
  title: 'New Title',
  description: 'New description'
});

// Delete bookmark
const deleted = dal.bookmarks.delete(1); // returns boolean

// Category operations
dal.bookmarks.addCategory(bookmarkId, categoryId);
dal.bookmarks.removeCategory(bookmarkId, categoryId);
const categoryIds = dal.bookmarks.getCategories(bookmarkId);
const bookmarks = dal.bookmarks.getByCategory(categoryId);

// Tag operations
dal.bookmarks.addTag(bookmarkId, tagId);
dal.bookmarks.removeTag(bookmarkId, tagId);
const tagIds = dal.bookmarks.getTags(bookmarkId);
const bookmarks = dal.bookmarks.getByTag(tagId);
```

## Categories API

### CategoriesDAL

```typescript
// Create a category
const category = dal.categories.create({
  name: 'My Category',
  description: 'Optional description',
  is_predefined: false
});

// Get category by ID or name
const category = dal.categories.getById(1);
const category = dal.categories.getByName('Web Security');

// Get all categories
const all = dal.categories.getAll();
const predefined = dal.categories.getPredefined();

// Update category
const updated = dal.categories.update(1, {
  name: 'Updated Name',
  description: 'Updated description'
});

// Delete category (predefined categories cannot be deleted)
const deleted = dal.categories.delete(1); // returns false for predefined
```

## Tags API

### TagsDAL

```typescript
// Create a tag
const tag = dal.tags.create({
  name: 'javascript',
  color: '#F7DF1E' // optional
});

// Get tag by ID or name
const tag = dal.tags.getById(1);
const tag = dal.tags.getByName('javascript');

// Get all tags (sorted alphabetically)
const tags = dal.tags.getAll();

// Update tag
const updated = dal.tags.update(1, {
  name: 'typescript',
  color: '#3178C6'
});

// Delete tag
const deleted = dal.tags.delete(1); // returns boolean
```

## Notes API

### NotesDAL

```typescript
// Create a note
const note = dal.notes.create({
  bookmark_id: 1,
  content: 'This is my note content'
});

// Get note by ID
const note = dal.notes.getById(1);

// Get all notes for a bookmark
const notes = dal.notes.getByBookmarkId(bookmarkId);

// Get all notes with optional pagination
const notes = dal.notes.getAll();
const page = dal.notes.getAll(10, 20);

// Update note
const updated = dal.notes.update(1, {
  content: 'Updated content'
});

// Delete note
const deleted = dal.notes.delete(1); // returns boolean
```

## Code Snippets API

### CodeSnippetsDAL

```typescript
// Create a code snippet
const snippet = dal.codeSnippets.create({
  bookmark_id: 1,
  language: 'javascript',
  code: 'console.log("Hello");',
  description: 'Optional description'
});

// Get snippet by ID
const snippet = dal.codeSnippets.getById(1);

// Get all snippets for a bookmark
const snippets = dal.codeSnippets.getByBookmarkId(bookmarkId);

// Get all snippets with optional pagination
const snippets = dal.codeSnippets.getAll();
const page = dal.codeSnippets.getAll(10, 20);

// Update snippet
const updated = dal.codeSnippets.update(1, {
  language: 'typescript',
  code: 'console.log("Hello");',
  description: 'Updated description'
});

// Delete snippet
const deleted = dal.codeSnippets.delete(1); // returns boolean
```

## Search API

### SearchDAL (FTS5 Full-Text Search)

```typescript
// Search across all content types
const results = dal.search.searchAll('security injection', 50);

// Search specific content types
const bookmarks = dal.search.searchBookmarks('cryptography', 20);
const notes = dal.search.searchNotes('authentication', 20);
const snippets = dal.search.searchCodeSnippets('bcrypt hash', 20);

// Results include:
// - id: number
// - type: 'bookmark' | 'note' | 'code_snippet'
// - title: string (if applicable)
// - content: string
// - snippet: string (HTML with <mark> tags highlighting matches)
// - rank: number (BM25 relevance score, lower is better)
```

### FTS5 Search Query Syntax

```typescript
// Simple term
dal.search.searchAll('security');

// Multiple terms (AND by default)
dal.search.searchAll('sql injection');

// OR operator
dal.search.searchAll('authentication OR authorization');

// NOT operator
dal.search.searchAll('security NOT mobile');

// Phrase search
dal.search.searchAll('"cross site scripting"');

// Prefix search
dal.search.searchAll('crypto*');

// Column filter (searches specific fields)
dal.search.searchBookmarks('title: OWASP');
```

## Type Definitions

All types are exported from the main module:

```typescript
import type {
  Bookmark,
  Category,
  Tag,
  Note,
  CodeSnippet,
  SearchResult,
  NewBookmark,
  UpdateBookmark,
  NewCategory,
  NewTag,
  NewNote,
  UpdateNote,
  NewCodeSnippet,
  UpdateCodeSnippet
} from 'bookmarks-manager';
```

## Migration Management

```typescript
import { runMigrations } from 'bookmarks-manager';

// Run pending migrations
runMigrations(db);

// Migrations are automatically run by initializeDatabase()
// Manual migration execution via CLI:
// npm run migrate [database-path]
```

## Database Cleanup

```typescript
// Close database connection
dal.close();

// Or access the underlying database
const db = dal.getDatabase();
db.close();
```

## Predefined Security Categories

The system seeds 12 predefined security categories:
1. Web Security
2. Cryptography
3. Network Security
4. Authentication & Authorization
5. Secure Coding
6. Penetration Testing
7. Incident Response
8. Compliance & Standards
9. Cloud Security
10. Mobile Security
11. API Security
12. DevSecOps

These categories have `is_predefined = 1` and cannot be deleted.
