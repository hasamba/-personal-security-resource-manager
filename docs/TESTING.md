# Testing Guide

This guide provides comprehensive instructions for testing the browser extensions.

## Test Environment Setup

### 1. Build Extensions

```bash
./scripts/build-all.sh
```

### 2. Start Desktop App

**For HTTP testing (recommended):**
```bash
python3 desktop-host/http-server.py
```

**For native messaging testing:**
Follow the [Native Messaging Setup Guide](NATIVE_MESSAGING.md)

### 3. Load Extensions

**Chrome:**
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `build/chrome`

**Firefox:**
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `build/firefox/manifest.json`

---

## Manual Testing Checklist

### Basic Functionality

#### ✅ Extension Installation
- [ ] Extension loads without errors
- [ ] Extension icon appears in toolbar
- [ ] Clicking icon opens popup

#### ✅ Popup UI
- [ ] Popup opens correctly
- [ ] All form fields are visible
- [ ] Character counters work
- [ ] Status indicator is visible
- [ ] Buttons are functional

#### ✅ Auto-Population
- [ ] Current page URL is auto-filled
- [ ] Current page title is auto-filled
- [ ] Fields can be edited after auto-fill

---

### Form Validation

#### ✅ URL Field
- [ ] Empty URL shows error
- [ ] Invalid URL shows error
- [ ] Valid HTTP URL is accepted
- [ ] Valid HTTPS URL is accepted
- [ ] FTP URLs are rejected
- [ ] Real-time validation works

#### ✅ Title Field
- [ ] Empty title shows error
- [ ] Title < 3 chars shows error
- [ ] Title > 200 chars shows error
- [ ] Valid title is accepted
- [ ] Real-time validation works

#### ✅ Tags Field
- [ ] Empty tags are allowed
- [ ] Single tag works
- [ ] Multiple comma-separated tags work
- [ ] > 20 tags shows error
- [ ] Tag > 50 chars shows error
- [ ] Invalid characters show error
- [ ] Real-time validation works

#### ✅ Notes Field
- [ ] Empty notes are allowed
- [ ] Notes < 1000 chars work
- [ ] Notes > 1000 chars show error
- [ ] Character counter updates
- [ ] Real-time validation works

#### ✅ Code Snippet Field
- [ ] Empty snippet is allowed
- [ ] Snippet < 5000 chars works
- [ ] Snippet > 5000 chars shows error
- [ ] Character counter updates
- [ ] Monospace font is applied

---

### Connection Status

#### ✅ Online Status
- [ ] Green dot when desktop app is running
- [ ] "Connected" message displays
- [ ] Connection check happens on popup open

#### ✅ Offline Status
- [ ] Red dot when desktop app is stopped
- [ ] "Desktop app unavailable" message
- [ ] Queue info appears when items queued

#### ✅ Connection Monitoring
- [ ] Status updates periodically
- [ ] Reconnection happens automatically
- [ ] Status persists across popup reopens

---

### Bookmark Saving

#### ✅ Online Saving
- [ ] Valid bookmark saves successfully
- [ ] Success notification appears
- [ ] Popup closes after success
- [ ] Bookmark appears in database
- [ ] Tags are saved correctly
- [ ] Notes are saved correctly
- [ ] Code snippet is saved correctly

#### ✅ Offline Saving
- [ ] Stop desktop app
- [ ] Save bookmark
- [ ] "Queued for sync" notification appears
- [ ] Bookmark added to queue
- [ ] Queue count updates
- [ ] Extension badge shows queue size

#### ✅ Queue Processing
- [ ] Restart desktop app
- [ ] Queue processes automatically
- [ ] Badge updates when queue empties
- [ ] All queued bookmarks are saved

---

### Context Menu

#### ✅ Basic Context Menu
- [ ] Right-click shows "Save to Bookmarks"
- [ ] Click opens popup
- [ ] Popup has correct URL/title

#### ✅ Selection Context Menu
- [ ] Select text on page
- [ ] Right-click shows "Save with selected text"
- [ ] Click saves bookmark with selection as notes
- [ ] Notification badge appears

---

### Background Processing

#### ✅ Service Worker
- [ ] Background script loads without errors
- [ ] Queue processing runs periodically
- [ ] Connection checks run in background
- [ ] Badge updates correctly

#### ✅ Alarms
- [ ] Alarm created for queue processing
- [ ] Alarm triggers every 5 minutes
- [ ] Queue processes on alarm

---

### Storage

#### ✅ Queue Storage
- [ ] Queued items persist after browser restart
- [ ] Queue survives extension reload
- [ ] Queue size is limited to 100 items
- [ ] Old items are removed after 5 failed retries

#### ✅ Storage Quota
- [ ] Extension doesn't exceed storage quota
- [ ] Large code snippets are handled

---

### Database

#### ✅ SQLite Database
- [ ] Database is created at `~/.bookmarks/bookmarks.db`
- [ ] Tables are created correctly
- [ ] Bookmarks are inserted correctly
- [ ] Tags are created/reused properly
- [ ] Relationships are correct

#### ✅ Data Integrity
- [ ] No duplicate tags created
- [ ] Foreign keys are maintained
- [ ] Timestamps are correct
- [ ] UTF-8 characters are handled

---

## Automated Testing

### Unit Tests

Create `tests/validation.test.js`:

```javascript
// Example unit test for validation
describe('ValidationManager', () => {
  test('URL validation rejects invalid URLs', () => {
    const error = ValidationManager.validateField('url', 'not-a-url');
    expect(error).toBeTruthy();
  });

  test('URL validation accepts valid URLs', () => {
    const error = ValidationManager.validateField('url', 'https://example.com');
    expect(error).toBeNull();
  });

  test('Title validation rejects short titles', () => {
    const error = ValidationManager.validateField('title', 'ab');
    expect(error).toBeTruthy();
  });

  test('Tags parsing splits correctly', () => {
    const tags = ValidationManager.parseTags('tag1, tag2, tag3');
    expect(tags).toEqual(['tag1', 'tag2', 'tag3']);
  });
});
```

### Integration Tests

#### Test Desktop App HTTP Endpoint

```bash
# Test health endpoint
curl http://localhost:8765/health

# Test bookmark creation
curl -X POST http://localhost:8765/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://test.com",
    "title": "Test Bookmark",
    "tags": ["test"],
    "notes": "Test notes",
    "codeSnippet": "test code",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }'
```

#### Test Native Messaging

```bash
# Test ping
echo '{"type":"ping"}' | python3 desktop-host/native-host.py | xxd

# Test bookmark save
echo '{"type":"save_bookmark","data":{"url":"https://test.com","title":"Test"}}' | \
  python3 desktop-host/native-host.py | xxd
```

---

## Testing Scenarios

### Scenario 1: Normal Operation

1. Start desktop app
2. Open extension popup
3. Verify green status indicator
4. Fill form with valid data
5. Click "Save"
6. Verify success notification
7. Check database for bookmark

**Expected:** Bookmark saved immediately, no queue

---

### Scenario 2: Offline Queue

1. Stop desktop app
2. Open extension popup
3. Verify red status indicator
4. Save 3 bookmarks
5. Verify queue count shows "3"
6. Verify badge shows "3"
7. Start desktop app
8. Wait 30 seconds
9. Verify queue empties
10. Check database for all 3 bookmarks

**Expected:** All bookmarks queued then synced

---

### Scenario 3: Queue Retry Logic

1. Stop desktop app
2. Save 1 bookmark
3. Verify queued
4. Start desktop app for 5 seconds
5. Stop desktop app before queue processes
6. Wait for next processing cycle
7. Repeat 3 times
8. Start desktop app and keep running
9. Verify bookmark eventually saves

**Expected:** Bookmark retries up to 5 times then succeeds

---

### Scenario 4: Form Validation

1. Open popup
2. Clear URL field
3. Try to save
4. Verify error message
5. Enter invalid URL
6. Verify error message
7. Enter valid URL
8. Clear title
9. Try to save
10. Verify error message

**Expected:** Form prevents invalid submissions

---

### Scenario 5: Context Menu Saving

1. Navigate to a webpage
2. Select some text
3. Right-click
4. Click "Save with selected text"
5. Verify notification badge appears
6. Check database
7. Verify bookmark saved with selected text as notes

**Expected:** Quick save without opening popup

---

### Scenario 6: Browser Restart

1. Queue 2 bookmarks (desktop app offline)
2. Close browser completely
3. Reopen browser
4. Check extension badge
5. Verify shows "2"
6. Start desktop app
7. Verify queue processes

**Expected:** Queue persists across browser restarts

---

### Scenario 7: Multiple Browser Windows

1. Open 2 browser windows
2. Open popup in both
3. Save bookmark in window 1
4. Check window 2 popup
5. Verify queue count updates in both

**Expected:** Queue state syncs across windows

---

### Scenario 8: Large Data

1. Open popup
2. Paste 900 characters in notes
3. Verify character counter
4. Paste 4900 characters in code snippet
5. Verify character counter
6. Add 19 tags
7. Save bookmark

**Expected:** Large valid data saves successfully

---

## Performance Testing

### Popup Load Time
- Popup should open in < 100ms
- Auto-fill should complete in < 50ms
- Connection check should complete in < 500ms

### Queue Processing
- Process 10 items in < 5 seconds
- Process 100 items in < 30 seconds

### Database Operations
- Insert bookmark in < 50ms
- Query bookmarks in < 100ms

---

## Browser Compatibility Testing

Test in multiple browsers:
- Chrome 109+
- Chrome Canary
- Chromium
- Microsoft Edge
- Firefox 109+
- Firefox Developer Edition

Verify all features work in each browser.

---

## Debugging Tips

### Chrome DevTools

**Popup debugging:**
1. Open popup
2. Right-click inside popup
3. Select "Inspect"

**Background script debugging:**
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker"

**View storage:**
```javascript
// In console
chrome.storage.local.get(null, console.log)
```

### Firefox DevTools

**Popup debugging:**
1. Open popup
2. Press F12 or Ctrl+Shift+I

**Background script debugging:**
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Inspect" on your extension

**View storage:**
```javascript
// In console
browser.storage.local.get(null).then(console.log)
```

### Common Issues

**Popup doesn't open:**
- Check browser console for errors
- Verify manifest.json is valid
- Check file paths in manifest

**Connection always offline:**
- Verify desktop app is running
- Check `curl http://localhost:8765/health`
- Review desktop app logs

**Queue not processing:**
- Check background script is running
- Verify alarms are created
- Check `chrome.alarms.getAll(console.log)`

**Database errors:**
- Check file permissions on `~/.bookmarks/`
- Verify SQLite is working: `sqlite3 ~/.bookmarks/bookmarks.db .tables`
- Review desktop app logs

---

## Test Data

### Valid Test Bookmarks

```javascript
// Minimal bookmark
{
  url: 'https://example.com',
  title: 'Example Site'
}

// Full bookmark
{
  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
  title: 'JavaScript | MDN',
  tags: ['javascript', 'documentation', 'web-dev'],
  notes: 'Comprehensive JavaScript reference documentation',
  codeSnippet: 'const greeting = (name) => `Hello, ${name}!`;'
}

// Bookmark with special characters
{
  url: 'https://example.com/page?query=test&foo=bar',
  title: 'Test Page with "Quotes" & Symbols',
  tags: ['test', 'special-chars'],
  notes: 'Testing UTF-8: 你好 مرحبا 🎉',
  codeSnippet: '// Comment with émojis 🚀\nconst test = "strings with \\"quotes\\""'
}
```

### Invalid Test Data

```javascript
// Invalid URL
{ url: 'not-a-url', title: 'Test' }

// Invalid title (too short)
{ url: 'https://example.com', title: 'ab' }

// Invalid tags (too many)
{ url: 'https://example.com', title: 'Test', tags: Array(21).fill('tag') }

// Invalid notes (too long)
{ url: 'https://example.com', title: 'Test', notes: 'a'.repeat(1001) }
```

---

## Reporting Issues

When reporting bugs, include:
1. Browser name and version
2. Extension version
3. Desktop app version
4. Steps to reproduce
5. Expected vs actual behavior
6. Console errors (if any)
7. Desktop app logs (if relevant)

Example bug report:
```
Browser: Chrome 120.0.6099.109
Extension: v1.0.0
Desktop App: HTTP Server

Steps:
1. Stop desktop app
2. Save bookmark
3. Restart desktop app
4. Queue doesn't process

Expected: Queue processes automatically
Actual: Queue stays full

Console errors:
None

Desktop app logs:
[No connection attempts seen]
```
