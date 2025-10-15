# Bookmarks Manager with SQLite and FTS5

A TypeScript-based bookmarks management system with full-text search capabilities using SQLite and FTS5.

## Features

- **Comprehensive Schema**: Tables for bookmarks, tags, categories, notes, and code snippets
- **Full-Text Search**: FTS5 virtual tables for searching across bookmarks, notes, and code snippets
- **Migration System**: Structured SQL migrations with automatic application
- **Predefined Categories**: Seeded security-related categories for quick organization
- **Type-Safe DAL**: TypeScript data access layer with full type coverage
- **Complete Test Suite**: Unit tests using temporary in-memory databases

## Database Schema

### Core Tables
- `bookmarks` - Main bookmark entries with title, URL, and description
- `categories` - Organizational categories (includes predefined security topics)
- `tags` - Flexible tagging system with optional colors
- `notes` - Rich text notes attached to bookmarks
- `code_snippets` - Code examples with language and description

### Mapping Tables
- `bookmark_categories` - Many-to-many relationship between bookmarks and categories
- `bookmark_tags` - Many-to-many relationship between bookmarks and tags

### FTS5 Virtual Tables
- `bookmarks_fts` - Full-text search on bookmark titles and descriptions
- `notes_fts` - Full-text search on note content
- `code_snippets_fts` - Full-text search on code and descriptions

## Installation

```bash
npm install
```

## Usage

### Initialize Database

```typescript
import { initializeDatabase, DatabaseAccessLayer } from './src/index.js';

// Create and migrate database
const db = initializeDatabase('bookmarks.db');
const dal = new DatabaseAccessLayer(db);
```

### Create Bookmarks

```typescript
const bookmark = dal.bookmarks.create({
  title: 'OWASP Top 10',
  url: 'https://owasp.org/top10',
  description: 'Web application security risks'
});
```

### Add Tags and Categories

```typescript
const tag = dal.tags.create({ name: 'security', color: '#FF5733' });
dal.bookmarks.addTag(bookmark.id, tag.id);

const category = dal.categories.getByName('Web Security');
if (category) {
  dal.bookmarks.addCategory(bookmark.id, category.id);
}
```

### Add Notes and Code Snippets

```typescript
dal.notes.create({
  bookmark_id: bookmark.id,
  content: 'Important security resource for web developers'
});

dal.codeSnippets.create({
  bookmark_id: bookmark.id,
  language: 'javascript',
  code: 'const sanitized = DOMPurify.sanitize(userInput);',
  description: 'XSS prevention example'
});
```

### Full-Text Search

```typescript
// Search across all content
const results = dal.search.searchAll('SQL injection');

// Search specific content types
const bookmarks = dal.search.searchBookmarks('cryptography');
const notes = dal.search.searchNotes('authentication');
const snippets = dal.search.searchCodeSnippets('bcrypt');
```

## Predefined Categories

The system includes 12 predefined security-related categories:
- Web Security
- Cryptography
- Network Security
- Authentication & Authorization
- Secure Coding
- Penetration Testing
- Incident Response
- Compliance & Standards
- Cloud Security
- Mobile Security
- API Security
- DevSecOps

## Development

### Run Tests

```bash
npm test
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

### Run Migrations

```bash
npm run migrate [database-path]
```

## Project Structure

```
src/
├── dal/                  # Data Access Layer
│   ├── bookmarks.ts
│   ├── categories.ts
│   ├── tags.ts
│   ├── notes.ts
│   ├── code-snippets.ts
│   ├── search.ts
│   └── index.ts
├── migrations/           # SQL migration files
│   ├── 001_initial_schema.sql
│   ├── 002_fts5_tables.sql
│   └── 003_seed_categories.sql
├── types/                # TypeScript type definitions
│   └── index.ts
├── utils/                # Utility functions
│   ├── database.ts
│   └── migrations.ts
└── index.ts              # Main exports

tests/                    # Unit tests
├── bookmarks.test.ts
├── categories.test.ts
├── tags.test.ts
├── notes.test.ts
├── code-snippets.test.ts
├── search.test.ts
└── migrations.test.ts
```

## License

MIT
