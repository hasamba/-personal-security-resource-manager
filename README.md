# Bookmark Manager Browser Extensions

Browser extensions for Chrome and Firefox that allow you to save bookmarks with rich metadata (tags, notes, code snippets) to a desktop application.

## Features

- 📌 Save bookmarks with custom metadata (tags, notes, code snippets)
- 🎨 Clean, intuitive popup UI with form validation
- 🔄 Automatic offline queuing when desktop app is unavailable
- 🌐 Support for both Chrome and Firefox
- 💬 Multiple communication channels (Native Messaging & HTTP)
- 📝 Context menu integration for quick bookmarking
- 🔔 Visual status indicators and notifications
- ⚡ Real-time connection monitoring

## Project Structure

```
.
├── extensions/
│   ├── chrome/              # Chrome-specific files
│   │   ├── manifest.json    # Manifest V3 for Chrome
│   │   └── icons/           # Chrome extension icons
│   ├── firefox/             # Firefox-specific files
│   │   ├── manifest.json    # Manifest V3 for Firefox
│   │   └── icons/           # Firefox extension icons
│   └── shared/              # Shared code between browsers
│       ├── html/            # Popup HTML
│       ├── css/             # Styles
│       └── js/              # JavaScript modules
│           ├── popup.js     # Main popup logic
│           ├── background.js # Background service worker
│           ├── communication.js # Desktop app communication
│           ├── queue.js     # Offline queue management
│           └── validation.js # Form validation
├── desktop-host/            # Desktop app communication
│   ├── http-server.py       # HTTP endpoint server
│   ├── native-host.py       # Native messaging host
│   ├── native-host.json     # Chrome native messaging config
│   └── native-host-firefox.json # Firefox native messaging config
├── scripts/                 # Build and utility scripts
│   ├── build-chrome.sh      # Build Chrome extension
│   ├── build-firefox.sh     # Build Firefox extension
│   ├── build-all.sh         # Build both extensions
│   └── generate-icons.py    # Generate extension icons
└── docs/                    # Documentation
```

## Quick Start

### 1. Build Extensions

```bash
# Build both extensions
./scripts/build-all.sh

# Or build individually
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

### 2. Start Desktop App

Choose one of the communication methods:

**Option A: HTTP Server (Recommended for development)**

```bash
python3 desktop-host/http-server.py
```

The server will run on `http://localhost:8765`.

**Option B: Native Messaging**

See [Native Messaging Setup](docs/NATIVE_MESSAGING.md) for detailed instructions.

### 3. Load Extension

**Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome` directory

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from `build/firefox` directory

## Usage

### Saving a Bookmark

1. Click the extension icon or use keyboard shortcut
2. The popup will auto-fill the current page's URL and title
3. Add tags (comma-separated), notes, and code snippets as needed
4. Click "Save"

### Context Menu

Right-click anywhere on a page:
- "Save to Bookmarks" - Opens the popup
- "Save with selected text" - Saves bookmark with selected text as notes

### Offline Mode

When the desktop app is unavailable:
- Bookmarks are automatically queued locally
- Queue size is shown in the popup and extension badge
- Bookmarks sync automatically when connection is restored

## Development

### Prerequisites

- Python 3.7+
- Modern browser (Chrome 109+ or Firefox 109+)
- Bash shell (for build scripts)

### Testing

1. Start the desktop app:
   ```bash
   python3 desktop-host/http-server.py
   ```

2. Load the extension in your browser (see Quick Start)

3. Test functionality:
   - Save a bookmark while desktop app is running
   - Stop the desktop app and save another bookmark (tests queuing)
   - Restart the desktop app (bookmarks should sync)

### Database

Bookmarks are stored in SQLite at `~/.bookmarks/bookmarks.db`

Schema:
- `bookmarks` - Main bookmark data
- `tags` - Tag definitions
- `bookmark_tags` - Many-to-many relationship

## Architecture

### Communication Flow

```
Extension Popup
    ↓
Communication Manager
    ↓
    ├─→ Native Messaging Host (native-host.py)
    └─→ HTTP Server (http-server.py)
    ↓
SQLite Database
```

### Offline Queue

When the desktop app is unavailable:
1. Bookmarks are stored in `chrome.storage.local`
2. Background service worker periodically checks connection
3. Queued bookmarks are sent when connection is restored
4. Failed items are retried up to 5 times

### Form Validation

- URL: Required, must be valid HTTP/HTTPS URL
- Title: Required, 3-200 characters
- Tags: Optional, max 20 tags, each max 50 chars, alphanumeric only
- Notes: Optional, max 1000 characters
- Code Snippet: Optional, max 5000 characters

## Browser Compatibility

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest V3 | ✅ | ✅ |
| Popup UI | ✅ | ✅ |
| Context Menus | ✅ | ✅ |
| Native Messaging | ✅ | ✅ |
| HTTP Communication | ✅ | ✅ |
| Offline Queue | ✅ | ✅ |

## Troubleshooting

### Extension not connecting to desktop app

1. Check if the desktop app is running:
   ```bash
   curl http://localhost:8765/health
   ```

2. Check browser console for errors (F12 → Console)

3. For native messaging, verify host configuration is correct

### Bookmarks not saving

1. Check the desktop app logs:
   - HTTP Server: Console output
   - Native Host: `/tmp/bookmark-native-host.log`

2. Verify database permissions:
   ```bash
   ls -la ~/.bookmarks/
   ```

3. Check extension's storage quota:
   - Chrome: `chrome://settings/cookies`
   - Firefox: `about:preferences#privacy`

### Queue not syncing

1. Check background service worker is running:
   - Chrome: `chrome://extensions/` → Extension details → "Inspect views: service worker"
   - Firefox: `about:debugging` → Extension details

2. Verify queue contents:
   ```javascript
   chrome.storage.local.get(['bookmark_queue'], console.log)
   ```

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style conventions
- Extensions work in both Chrome and Firefox
- Offline queue functionality is preserved
- Form validation rules are respected

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check [Troubleshooting](#troubleshooting)
- Review [Documentation](docs/)
- Open an issue on the repository
