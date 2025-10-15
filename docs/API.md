# API Documentation

## Desktop App Communication Protocol

The browser extension communicates with the desktop app using two methods:
1. HTTP REST API (localhost:8765)
2. Native Messaging (stdio-based protocol)

Both methods use the same message format.

---

## HTTP API

Base URL: `http://localhost:8765`

### Health Check

**Endpoint:** `GET /health`

Check if the desktop app is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Desktop app is running"
}
```

**Status Codes:**
- `200` - App is running
- Connection refused - App is not running

---

### Save Bookmark

**Endpoint:** `POST /bookmarks`

Save a new bookmark to the database.

**Request Body:**
```json
{
  "url": "https://example.com",
  "title": "Example Website",
  "tags": ["web", "example", "tutorial"],
  "notes": "This is a great resource for learning...",
  "codeSnippet": "function example() {\n  return 'code';\n}",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | Full URL including protocol |
| `title` | string | Yes | Bookmark title (3-200 chars) |
| `tags` | array | No | Array of tag strings |
| `notes` | string | No | User notes (max 1000 chars) |
| `codeSnippet` | string | No | Code snippet (max 5000 chars) |
| `createdAt` | string | No | ISO 8601 timestamp |

**Response (Success):**
```json
{
  "success": true,
  "bookmark_id": 42
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Error message"
}
```

**Status Codes:**
- `201` - Bookmark created successfully
- `400` - Invalid request data
- `500` - Internal server error

**Example using curl:**
```bash
curl -X POST http://localhost:8765/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "title": "Example Site",
    "tags": ["example"],
    "notes": "A test bookmark",
    "codeSnippet": "",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }'
```

---

## Native Messaging Protocol

Native messaging uses a binary protocol over stdin/stdout.

### Message Format

**Request:**
```
[4 bytes: message length (uint32, native byte order)]
[N bytes: JSON message (UTF-8)]
```

**Response:**
Same format as request.

### Message Types

#### Ping

Test if the native host is running.

**Request:**
```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "success": true
}
```

#### Save Bookmark

Save a bookmark via native messaging.

**Request:**
```json
{
  "type": "save_bookmark",
  "data": {
    "url": "https://example.com",
    "title": "Example Website",
    "tags": ["web", "example"],
    "notes": "My notes",
    "codeSnippet": "console.log('hello');",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "bookmark_id": 42
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

---

## Extension Internal API

### Communication Manager

**Module:** `extensions/shared/js/communication.js`

#### Methods

##### `initialize()`
Initialize the communication manager and start connection monitoring.

```javascript
await CommunicationManager.initialize();
```

##### `sendBookmark(bookmark)`
Send a bookmark to the desktop app.

```javascript
const bookmark = {
  url: 'https://example.com',
  title: 'Example',
  tags: ['tag1', 'tag2'],
  notes: 'My notes',
  codeSnippet: 'code here',
  createdAt: new Date().toISOString()
};

try {
  const result = await CommunicationManager.sendBookmark(bookmark);
  console.log('Saved:', result.bookmark_id);
} catch (error) {
  console.error('Failed to save:', error);
}
```

##### `checkConnection()`
Check connection status to desktop app.

```javascript
const isConnected = await CommunicationManager.checkConnection();
```

##### `registerStatusCallback(callback)`
Register a callback for connection status changes.

```javascript
CommunicationManager.registerStatusCallback((status) => {
  console.log('Connection status:', status); // 'online', 'offline', or 'checking'
});
```

##### `getConnectionStatus()`
Get current connection status.

```javascript
const status = CommunicationManager.getConnectionStatus();
```

---

### Queue Manager

**Module:** `extensions/shared/js/queue.js`

#### Methods

##### `addToQueue(bookmark)`
Add a bookmark to the offline queue.

```javascript
try {
  const queued = await QueueManager.addToQueue(bookmark);
  console.log('Queued:', queued.id);
} catch (error) {
  console.error('Queue full or error:', error);
}
```

##### `getQueue()`
Get all queued bookmarks.

```javascript
const queue = await QueueManager.getQueue();
console.log('Queue size:', queue.length);
```

##### `getQueueSize()`
Get the number of queued items.

```javascript
const size = await QueueManager.getQueueSize();
```

##### `processQueue(sendFunction)`
Process the queue, sending each bookmark using the provided function.

```javascript
const result = await QueueManager.processQueue(
  (bookmark) => CommunicationManager.sendBookmark(bookmark)
);

console.log('Processed:', result.processed);
console.log('Failed:', result.failed);
console.log('Remaining:', result.remaining);
```

##### `clearQueue()`
Clear all queued bookmarks.

```javascript
await QueueManager.clearQueue();
```

##### `getQueueStats()`
Get queue statistics.

```javascript
const stats = await QueueManager.getQueueStats();
console.log('Size:', stats.size);
console.log('Oldest:', stats.oldestItem);
console.log('Has failures:', stats.hasFailedItems);
```

##### `registerQueueCallback(callback)`
Register a callback for queue changes.

```javascript
QueueManager.registerQueueCallback((queue) => {
  console.log('Queue updated, size:', queue.length);
});
```

---

### Validation Manager

**Module:** `extensions/shared/js/validation.js`

#### Methods

##### `validateField(fieldName, value)`
Validate a single field.

```javascript
const error = ValidationManager.validateField('url', 'https://example.com');
if (error) {
  console.error('Validation error:', error);
}
```

##### `validateForm(formData)`
Validate entire form data.

```javascript
const formData = {
  url: 'https://example.com',
  title: 'Example',
  tags: 'web, dev',
  notes: 'My notes',
  codeSnippet: ''
};

const { isValid, errors } = ValidationManager.validateForm(formData);
if (!isValid) {
  console.error('Validation errors:', errors);
}
```

##### `displayError(fieldName, errorMessage)`
Display validation error in UI.

```javascript
ValidationManager.displayError('url', 'Invalid URL format');
```

##### `clearErrors()`
Clear all validation errors from UI.

```javascript
ValidationManager.clearErrors();
```

##### `setupRealtimeValidation(fieldName)`
Set up real-time validation for a field.

```javascript
ValidationManager.setupRealtimeValidation('url');
```

##### `parseTags(tagsString)`
Parse comma-separated tags string.

```javascript
const tags = ValidationManager.parseTags('javascript, tutorial, webdev');
// Returns: ['javascript', 'tutorial', 'webdev']
```

---

## Validation Rules

### URL
- Required
- Must be valid URL
- Must use HTTP or HTTPS protocol

### Title
- Required
- Minimum 3 characters
- Maximum 200 characters

### Tags
- Optional
- Maximum 20 tags
- Each tag maximum 50 characters
- Only letters, numbers, hyphens, underscores, and spaces
- Automatically converted to lowercase

### Notes
- Optional
- Maximum 1000 characters

### Code Snippet
- Optional
- Maximum 5000 characters

---

## Storage

### Chrome Storage Local

The extension uses `chrome.storage.local` for persistent data.

#### Keys

- `bookmark_queue` - Array of queued bookmarks

#### Structure

```javascript
{
  bookmark_queue: [
    {
      id: "1234567890-abc123",
      url: "https://example.com",
      title: "Example",
      tags: ["tag1"],
      notes: "Notes",
      codeSnippet: "",
      createdAt: "2024-01-15T10:30:00.000Z",
      queuedAt: "2024-01-15T10:35:00.000Z",
      retryCount: 0,
      lastError: null,
      lastRetryAt: null
    }
  ]
}
```

---

## Database Schema

The desktop app stores bookmarks in SQLite at `~/.bookmarks/bookmarks.db`.

### Tables

#### bookmarks

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| url | TEXT NOT NULL | Bookmark URL |
| title | TEXT NOT NULL | Bookmark title |
| notes | TEXT | User notes |
| code_snippet | TEXT | Code snippet |
| created_at | TEXT NOT NULL | ISO 8601 timestamp |
| updated_at | TEXT NOT NULL | ISO 8601 timestamp |

#### tags

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| name | TEXT UNIQUE NOT NULL | Tag name |

#### bookmark_tags

| Column | Type | Description |
|--------|------|-------------|
| bookmark_id | INTEGER | Foreign key to bookmarks.id |
| tag_id | INTEGER | Foreign key to tags.id |

**Primary Key:** (bookmark_id, tag_id)

### Example Queries

**Get all bookmarks with tags:**
```sql
SELECT b.*, GROUP_CONCAT(t.name) as tags
FROM bookmarks b
LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
LEFT JOIN tags t ON bt.tag_id = t.id
GROUP BY b.id
ORDER BY b.created_at DESC;
```

**Search bookmarks by tag:**
```sql
SELECT DISTINCT b.*
FROM bookmarks b
JOIN bookmark_tags bt ON b.id = bt.bookmark_id
JOIN tags t ON bt.tag_id = t.id
WHERE t.name = 'javascript';
```

**Search bookmarks by text:**
```sql
SELECT *
FROM bookmarks
WHERE title LIKE '%search%'
   OR notes LIKE '%search%'
   OR code_snippet LIKE '%search%';
```

---

## Error Handling

### HTTP Errors

```javascript
try {
  await CommunicationManager.sendBookmark(bookmark);
} catch (error) {
  // Connection timeout, network error, or HTTP error
  console.error(error.message);
  
  // Fallback to queue
  await QueueManager.addToQueue(bookmark);
}
```

### Queue Errors

```javascript
try {
  await QueueManager.addToQueue(bookmark);
} catch (error) {
  // Queue is full (max 100 items)
  console.error('Cannot queue:', error.message);
}
```

### Validation Errors

```javascript
const { isValid, errors } = ValidationManager.validateForm(formData);

if (!isValid) {
  // errors = { url: "Invalid URL", title: "Title is required" }
  Object.entries(errors).forEach(([field, message]) => {
    ValidationManager.displayError(field, message);
  });
}
```

---

## Events

### Extension Events

The extension emits and listens to various Chrome extension events:

#### Background Script Events

```javascript
// Extension installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // First install
  } else if (details.reason === 'update') {
    // Extension updated
  }
});

// Browser started
chrome.runtime.onStartup.addListener(() => {
  // Initialize extension
});

// Storage changed
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmark_queue) {
    // Queue updated
    const newQueue = changes.bookmark_queue.newValue;
  }
});

// Alarm (periodic tasks)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'processQueue') {
    // Process queued bookmarks
  }
});
```

### Custom Events

The extension modules use callback patterns for custom events:

```javascript
// Connection status changed
CommunicationManager.registerStatusCallback((status) => {
  // Handle status change
});

// Queue updated
QueueManager.registerQueueCallback((queue) => {
  // Handle queue change
});
```
