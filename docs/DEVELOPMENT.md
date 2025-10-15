# Development Guide

This guide is for developers who want to modify, extend, or contribute to the Bookmark Manager extensions.

## Project Architecture

### Directory Structure

```
extensions/
├── chrome/              # Chrome-specific configuration
├── firefox/             # Firefox-specific configuration
└── shared/              # Shared code (99% of the codebase)
    ├── html/            # Popup UI
    ├── css/             # Styles
    └── js/              # JavaScript modules
        ├── popup.js           # Main popup logic
        ├── background.js      # Service worker
        ├── communication.js   # Desktop app communication
        ├── queue.js           # Offline queue management
        └── validation.js      # Form validation
```

### Module System

The extensions use the **Revealing Module Pattern** for code organization:

```javascript
const ModuleName = (function() {
  // Private variables
  let privateVar = 'private';
  
  // Private functions
  function privateFunction() {
    return privateVar;
  }
  
  // Public API
  return {
    publicMethod: function() {
      return privateFunction();
    }
  };
})();
```

This provides:
- Encapsulation
- Clear public API
- No external dependencies
- Works in both Chrome and Firefox

## Development Workflow

### 1. Make Changes

Edit files in `extensions/shared/` for changes that affect both browsers.

Edit files in `extensions/chrome/` or `extensions/firefox/` for browser-specific changes.

### 2. Rebuild

```bash
# Rebuild both
./scripts/build-all.sh

# Or rebuild individually
./scripts/build-chrome.sh
./scripts/build-firefox.sh
```

### 3. Reload Extension

**Chrome:**
- Go to `chrome://extensions/`
- Click the reload icon on your extension

**Firefox:**
- Go to `about:debugging#/runtime/this-firefox`
- Click "Reload" on your extension

### 4. Test Changes

- Open the extension popup
- Check browser console (F12) for errors
- Test all affected functionality

## Key Concepts

### Communication Flow

```
User clicks extension icon
    ↓
popup.js initializes
    ↓
CommunicationManager checks connection
    ↓
    ├─→ Tries Native Messaging first
    └─→ Falls back to HTTP
    ↓
Connection status updates UI
    ↓
User fills form
    ↓
ValidationManager validates input
    ↓
    ├─→ If valid, proceed
    └─→ If invalid, show errors
    ↓
CommunicationManager.sendBookmark()
    ↓
    ├─→ If online: Send immediately
    └─→ If offline: QueueManager.addToQueue()
    ↓
Success/Error notification
```

### State Management

The extension uses Chrome storage for persistent state:

```javascript
// Queue stored in chrome.storage.local
{
  bookmark_queue: [
    {
      id: "unique-id",
      url: "...",
      title: "...",
      queuedAt: "2024-01-15T10:30:00Z",
      retryCount: 0
    }
  ]
}
```

Access storage:
```javascript
// Get
chrome.storage.local.get(['bookmark_queue'], (result) => {
  console.log(result.bookmark_queue);
});

// Set
chrome.storage.local.set({ bookmark_queue: [] });

// Listen for changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (changes.bookmark_queue) {
    console.log('Queue changed');
  }
});
```

### Background Service Worker

Chrome Manifest V3 uses service workers instead of persistent background pages:

**Key Differences:**
- Service worker can be terminated by browser
- Must use alarms for periodic tasks
- Cannot use DOM APIs
- Must handle wake-up from idle state

**Our Implementation:**
```javascript
// Create periodic alarm
chrome.alarms.create('processQueue', { periodInMinutes: 5 });

// Handle alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'processQueue') {
    processQueue();
  }
});
```

## Common Development Tasks

### Add a New Form Field

1. **Update HTML** (`extensions/shared/html/popup.html`):
```html
<div class="form-group">
  <label for="new-field">New Field</label>
  <input type="text" id="new-field" name="newField">
  <span class="error-message" id="new-field-error"></span>
</div>
```

2. **Add Validation** (`extensions/shared/js/validation.js`):
```javascript
const validators = {
  // ...
  newField: {
    validate: (value) => {
      if (!value) return 'Field is required';
      return null;
    }
  }
};
```

3. **Update Form Handler** (`extensions/shared/js/popup.js`):
```javascript
function getFormData() {
  return {
    // ...
    newField: document.getElementById('new-field').value.trim()
  };
}
```

4. **Update Backend** (`desktop-host/http-server.py` and `native-host.py`):
```python
cursor.execute('''
    INSERT INTO bookmarks (url, title, notes, code_snippet, new_field, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
''', (
    # ...
    bookmark_data.get('newField', ''),
    # ...
))
```

### Add a New API Endpoint

**HTTP Server** (`desktop-host/http-server.py`):
```python
def do_GET(self):
    if self.path == '/bookmarks':
        self._set_headers()
        bookmarks = get_all_bookmarks()
        self.wfile.write(json.dumps(bookmarks).encode())
    # ...
```

**Communication Module** (`extensions/shared/js/communication.js`):
```javascript
async function getBookmarks() {
  const response = await fetch(`${HTTP_ENDPOINT}/bookmarks`);
  if (!response.ok) throw new Error('Failed to fetch');
  return await response.json();
}
```

### Add Browser-Specific Features

**Check Browser:**
```javascript
const isChrome = typeof chrome !== 'undefined' && chrome.runtime;
const isFirefox = typeof browser !== 'undefined';

if (isChrome) {
  // Chrome-specific code
} else if (isFirefox) {
  // Firefox-specific code
}
```

**Manifest Differences:**

Chrome (`extensions/chrome/manifest.json`):
```json
{
  "background": {
    "service_worker": "../shared/js/background.js"
  }
}
```

Firefox (`extensions/firefox/manifest.json`):
```json
{
  "background": {
    "scripts": ["../shared/js/background.js"]
  },
  "browser_specific_settings": {
    "gecko": {
      "id": "bookmarkmanager@example.com"
    }
  }
}
```

### Change Communication Port

1. **Update Extension** (`extensions/shared/js/communication.js`):
```javascript
const HTTP_ENDPOINT = 'http://localhost:9000'; // Changed from 8765
```

2. **Update Server** (`desktop-host/http-server.py`):
```python
PORT = 9000  # Changed from 8765
```

3. **Update Manifests**:
```json
{
  "host_permissions": [
    "http://localhost:9000/*"
  ]
}
```

4. Rebuild extensions

## Debugging

### Browser Console

**Popup:**
- Right-click in popup → Inspect
- Console shows popup.js logs

**Background Script:**
- Chrome: `chrome://extensions/` → Extension details → "Inspect views: service worker"
- Firefox: `about:debugging` → Extension → Inspect

**Content Scripts** (if added):
- Open page → F12 → Console

### Logging Best Practices

```javascript
// Development
console.log('Debug info:', data);

// Production
if (DEBUG) {
  console.log('Debug info:', data);
}

// Errors (always log)
console.error('Error:', error);
```

### Common Issues

**Service worker not running:**
```javascript
// In popup.js, wake up service worker
chrome.runtime.sendMessage({ type: 'ping' }, (response) => {
  console.log('Background script is awake');
});
```

**Storage quota exceeded:**
```javascript
// Check usage
chrome.storage.local.getBytesInUse(null, (bytes) => {
  console.log('Using', bytes, 'bytes');
  // Quota: 5MB (Chrome), 10MB (Firefox)
});
```

**CORS errors with HTTP:**
- Make sure server sends `Access-Control-Allow-Origin: *`
- Check `host_permissions` in manifest

## Testing

### Manual Testing

See [TESTING.md](TESTING.md) for comprehensive test cases.

### Automated Testing

Add unit tests for validation:

```javascript
// tests/validation.test.js
describe('URL Validation', () => {
  test('rejects invalid URLs', () => {
    expect(ValidationManager.validateField('url', 'invalid')).toBeTruthy();
  });
  
  test('accepts valid URLs', () => {
    expect(ValidationManager.validateField('url', 'https://example.com')).toBeNull();
  });
});
```

Run tests:
```bash
# If using Jest
npm test

# If using browser-based testing
# Open tests/runner.html in browser
```

## Performance Optimization

### Minimize Storage Writes

```javascript
// Bad: Multiple writes
await chrome.storage.local.set({ item1: 'value1' });
await chrome.storage.local.set({ item2: 'value2' });

// Good: Single write
await chrome.storage.local.set({
  item1: 'value1',
  item2: 'value2'
});
```

### Debounce Expensive Operations

```javascript
let debounceTimeout;
field.addEventListener('input', () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    // Expensive operation here
  }, 300);
});
```

### Lazy Load Resources

```javascript
// Only load when needed
async function getAdvancedFeature() {
  const module = await import('./advanced-feature.js');
  return module.default;
}
```

## Browser Compatibility

### Target Versions
- Chrome 109+ (Manifest V3 stable)
- Firefox 109+ (Manifest V3 stable)

### Polyfills

For cross-browser compatibility:

```javascript
// Use 'chrome' in both browsers
const browserAPI = typeof chrome !== 'undefined' ? chrome : browser;
browserAPI.storage.local.get(...);
```

### Testing Across Browsers

Test in:
- Chrome stable
- Chrome Beta
- Firefox stable
- Firefox Developer Edition
- Edge (Chromium-based)

## Code Style

### JavaScript

- Use modern ES6+ features
- Prefer `const` over `let`, never `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Use async/await over Promises

```javascript
// Good
const handleSubmit = async (event) => {
  event.preventDefault();
  const data = getFormData();
  try {
    await sendBookmark(data);
  } catch (error) {
    console.error('Failed:', error);
  }
};

// Avoid
function handleSubmit(event) {
  event.preventDefault();
  var data = getFormData();
  sendBookmark(data).then(function(result) {
    // ...
  }).catch(function(error) {
    console.error('Failed:', error);
  });
}
```

### CSS

- Use semantic class names
- Follow BEM naming convention
- Use CSS variables for themes
- Mobile-first responsive design

```css
/* Good */
.form-group { }
.form-group__label { }
.form-group__input--error { }

/* Avoid */
.fg { }
.label1 { }
.red-input { }
```

### HTML

- Semantic HTML5 elements
- Accessible forms (labels, ARIA)
- Valid markup

## Security Considerations

### Input Validation

Always validate on both client and server:

```javascript
// Client-side (extensions/shared/js/validation.js)
function validateURL(url) {
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL';
  }
}

// Server-side (desktop-host/http-server.py)
def validate_bookmark(data):
    if 'url' not in data:
        raise ValueError('URL is required')
    # More validation...
```

### SQL Injection Prevention

Always use parameterized queries:

```python
# Good
cursor.execute('SELECT * FROM bookmarks WHERE id = ?', (bookmark_id,))

# NEVER do this
cursor.execute(f'SELECT * FROM bookmarks WHERE id = {bookmark_id}')
```

### XSS Prevention

Sanitize user input in UI:

```javascript
// Use textContent, not innerHTML
element.textContent = userInput;

// If HTML is needed, sanitize first
element.innerHTML = sanitizeHTML(userInput);
```

### Content Security Policy

The extension has a strict CSP (in manifest.json):
- No inline scripts
- No eval()
- Only HTTPS resources (except localhost)

## Contributing

### Before Submitting PR

1. Test in both Chrome and Firefox
2. Test online and offline modes
3. Check for console errors
4. Verify database integrity
5. Update documentation

### Commit Message Format

```
type(scope): brief description

Detailed explanation if needed

Fixes #123
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Testing
- `chore`: Maintenance

Example:
```
feat(popup): add export bookmarks button

- Add export button to popup UI
- Implement CSV export functionality
- Add validation for export format

Closes #45
```

## Resources

### Official Documentation
- [Chrome Extensions](https://developer.chrome.com/docs/extensions/)
- [Firefox Add-ons](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

### Tools
- [web-ext](https://github.com/mozilla/web-ext) - Firefox extension CLI tool
- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/jifpbeccnghkjeaalbbjmodiffmgedin)

### Community
- [Chrome Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Firefox Add-ons Discourse](https://discourse.mozilla.org/c/add-ons/35)
- [Stack Overflow - chrome-extension tag](https://stackoverflow.com/questions/tagged/chrome-extension)
