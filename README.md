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
# Monorepo - Desktop App, Backend Service, and Browser Extensions

A comprehensive monorepo for managing bookmarks, tags, categories, and notes across desktop, web, and browser extensions.

## Project Structure

```
.
├── apps/
│   ├── desktop/          # Electron + React + Vite desktop application
│   └── backend/          # Express.js REST API backend service
├── extensions/
│   ├── chrome/           # Chrome browser extension
│   └── firefox/          # Firefox browser extension
├── packages/
│   └── shared/           # Shared types, utilities, and contracts
└── .github/
    └── workflows/        # CI/CD workflows
```

## Features

- 📦 **pnpm workspaces** for efficient dependency management
- 🎯 **TypeScript** with strict mode for type safety
- ⚡ **Vite** for fast development and building
- ⚛️ **React 18** for modern UI development
- 🖥️ **Electron** for cross-platform desktop applications
- 🌐 **Express.js** for RESTful API backend
- 🧪 **Vitest** for fast unit testing
- 🔍 **ESLint** for code quality
- 💅 **Prettier** for code formatting
- 🔄 **GitHub Actions** for CI/CD

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

## Getting Started

### Installation

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific workspace
pnpm --filter @monorepo/backend dev
pnpm --filter @monorepo/desktop dev
pnpm --filter @monorepo/extension-chrome dev
pnpm --filter @monorepo/extension-firefox dev
```

### Building

```bash
# Build all workspaces
pnpm build

# Build specific workspace
pnpm --filter @monorepo/backend build
```

### Testing

```bash
# Run tests in all workspaces
pnpm test

# Run tests in watch mode
pnpm --recursive test:watch
```

### Linting & Formatting

```bash
# Lint all files
pnpm lint

# Format all files
pnpm format

# Check formatting
pnpm format:check
```

### Type Checking

```bash
# Type check all workspaces
pnpm typecheck
```

## Workspace Details

### Shared Package (`@monorepo/shared`)

Contains shared TypeScript types, utilities, and contracts used across all applications.

**Key Exports:**
- Types: `Bookmark`, `Tag`, `Category`, `Note`
- Contracts: IPC events, API endpoints
- Configuration: Environment config helpers
- Utilities: Validators and common functions

### Backend Service (`@monorepo/backend`)

Express.js REST API server providing CRUD operations for bookmarks, tags, categories, and notes.

**Endpoints:**
- `GET /health` - Health check
- `/api/bookmarks` - Bookmark management
- `/api/tags` - Tag management
- `/api/categories` - Category management
- `/api/notes` - Note management

**Environment Variables:**
```bash
NODE_ENV=development
API_PORT=3000
API_BASE_URL=http://localhost:3000
```

### Desktop App (`@monorepo/desktop`)

Cross-platform desktop application built with Electron, React, and Vite.

**Architecture:**
- Main process: Electron main and IPC handlers
- Renderer process: React application with Vite
- Preload script: Secure IPC bridge

### Chrome Extension (`@monorepo/extension-chrome`)

Chrome browser extension for quick bookmark management.

**Features:**
- Service worker background script
- Popup interface for saving bookmarks
- Content script for page interaction

### Firefox Extension (`@monorepo/extension-firefox`)

Firefox browser extension with similar functionality to the Chrome version.

## Scripts Reference

### Root Scripts
- `pnpm dev` - Run all apps in development mode
- `pnpm build` - Build all workspaces
- `pnpm test` - Run tests in all workspaces
- `pnpm lint` - Lint all files
- `pnpm format` - Format all files
- `pnpm typecheck` - Type check all workspaces
- `pnpm clean` - Clean build artifacts

### Workspace Scripts
Each workspace has its own scripts:
- `dev` - Start development server
- `build` - Build for production
- `test` - Run tests
- `typecheck` - Type check
- `clean` - Clean build artifacts

## Architecture

### Type Safety

All shared types are defined in `@monorepo/shared` and imported across workspaces, ensuring type consistency.

### IPC Communication (Desktop)

The desktop app uses a strongly-typed IPC system:
1. Main process handles IPC events
2. Preload script exposes safe APIs to renderer
3. Renderer uses typed contracts from `@monorepo/shared`

### API Contracts (Backend)

REST API endpoints are typed using interfaces from `@monorepo/shared`, ensuring request/response type safety.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting: `pnpm test && pnpm lint`
4. Commit your changes
5. Push and create a pull request

## License

MIT
