# Bookmark Manager

A desktop application for managing bookmarks with notes, code snippets, tags, and categories. Built with React, TypeScript, and Electron.

## Features

- **Dashboard**: Overview of bookmarks with statistics
- **Bookmark Management**: Create, edit, delete bookmarks with rich metadata
- **Search & Filter**: Instant search with tag and category filtering
- **Markdown Support**: Notes and code snippets with markdown and syntax highlighting
- **Tag Management**: Organize bookmarks with tags
- **Categories**: Group bookmarks by categories
- **Favorites**: Mark important bookmarks as favorites
- **Export/Import**: Export bookmarks as JSON or HTML
- **Desktop App**: Cross-platform desktop application

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Zustand
- **Routing**: React Router
- **Styling**: CSS with CSS Variables
- **Markdown**: react-markdown with remark-gfm
- **Code Highlighting**: react-syntax-highlighter
- **Desktop**: Electron
- **Build Tool**: Vite
- **Testing**: Playwright for E2E tests

## Installation

```bash
npm install
```

## Development

Run the application in development mode:

```bash
npm run dev
```

This starts both the React dev server and Electron.

Run only React:

```bash
npm run dev:react
```

Run only Electron:

```bash
npm run dev:electron
```

## Building

Build the application:

```bash
npm run build
```

Package for distribution:

```bash
# Package for current platform
npm run package

# Package for specific platforms
npm run package:win
npm run package:mac
npm run package:linux
```

## Testing

Run E2E smoke tests:

```bash
npm run test:e2e
```

## Project Structure

```
├── electron/               # Electron main process
│   ├── main.ts            # Main process entry
│   ├── preload.ts         # Preload script for IPC
│   └── services/          # Backend services
│       └── BookmarkService.ts
├── src/                   # React application
│   ├── components/        # Reusable components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand store
│   ├── styles/           # CSS styles
│   └── types/            # TypeScript types
├── tests/                # E2E tests
│   └── e2e/
│       └── smoke.spec.ts
└── dist/                 # Build output
```

## Usage

### Creating a Bookmark

1. Navigate to the Bookmarks page
2. Click "New Bookmark"
3. Fill in the details (title, URL, description, tags, category)
4. Add notes or code snippets using markdown
5. Click "Save"

### Searching and Filtering

- Use the search bar for instant search across all bookmark fields
- Filter by tags, categories, or favorites
- Combine multiple filters for precise results

### Markdown and Code Snippets

The application supports full markdown syntax in notes and code snippets:

```markdown
# Heading
- List item
**Bold** and *italic*

\`\`\`javascript
const example = 'code';
\`\`\`
```

### Exporting Bookmarks

1. Go to Settings
2. Select export format (JSON or HTML)
3. Click "Export"
4. Save the file to your desired location

## License

MIT
