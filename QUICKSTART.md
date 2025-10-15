# Quick Start Guide

Get up and running with the Bookmark Manager extensions in 5 minutes!

## Prerequisites

- Python 3.7 or higher
- Chrome 109+ or Firefox 109+
- Bash shell (Linux/macOS/WSL)

## Step 1: Build the Extensions (30 seconds)

```bash
# Clone or navigate to the project directory
cd /path/to/bookmark-manager-extensions

# Make scripts executable (if not already)
chmod +x scripts/*.sh

# Build both extensions
./scripts/build-all.sh
```

You should see:
```
Building Chrome extension...
Chrome extension built successfully at: /path/to/build/chrome

Building Firefox extension...
Firefox extension built successfully at: /path/to/build/firefox
```

## Step 2: Start the Desktop App (10 seconds)

Open a new terminal and run:

```bash
python3 desktop-host/http-server.py
```

You should see:
```
INFO:root:Database initialized
INFO:root:Starting HTTP server on http://127.0.0.1:8765
INFO:root:Press Ctrl+C to stop the server
```

**Keep this terminal running!**

## Step 3: Load the Extension (1 minute)

### For Chrome:

1. Open Chrome and navigate to: `chrome://extensions/`
2. Toggle "Developer mode" ON (top-right corner)
3. Click "Load unpacked" button
4. Navigate to and select the `build/chrome` directory
5. The extension should now appear in your toolbar!

### For Firefox:

1. Open Firefox and navigate to: `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to `build/firefox` and select `manifest.json`
4. The extension should now appear in your toolbar!

## Step 4: Test It Out! (1 minute)

1. **Click the extension icon** in your browser toolbar
   - You should see a popup with a form
   - The URL and title should auto-fill with the current page

2. **Check the connection status** (top of popup)
   - You should see a **green dot** with "Connected to desktop app"
   - If you see red, make sure the Python server is running (Step 2)

3. **Save your first bookmark:**
   - The form should already have the URL and title filled
   - Add some tags: `test, example, tutorial`
   - Add notes: `This is my first bookmark!`
   - Click **Save**
   - You should see a success message!

4. **Verify it saved:**
   ```bash
   # In a new terminal
   sqlite3 ~/.bookmarks/bookmarks.db "SELECT title, url FROM bookmarks;"
   ```

## Step 5: Test Offline Mode (1 minute)

1. **Stop the desktop app** (Ctrl+C in the server terminal)

2. **Open the extension popup again**
   - You should see a **red dot** with "Desktop app unavailable"
   - Queue info should appear when you save

3. **Save another bookmark**
   - Fill in the form
   - Click Save
   - You should see: "Desktop app unavailable. Bookmark queued for later sync."

4. **Check the queue**
   - Extension badge should show "1"
   - Popup should show "1 bookmark(s) queued for sync"

5. **Restart the desktop app**
   ```bash
   python3 desktop-host/http-server.py
   ```

6. **Wait about 30 seconds**
   - The queued bookmark will automatically sync
   - Badge should disappear
   - Check the database again to verify

## What's Next?

### Customize the Extension

- **Change the port:** Edit `HTTP_ENDPOINT` in `extensions/shared/js/communication.js`
- **Change database location:** Edit `DB_PATH` in `desktop-host/http-server.py`
- **Adjust queue size:** Edit `MAX_QUEUE_SIZE` in `extensions/shared/js/queue.js`

### Set Up Native Messaging (More Secure)

For production use, consider using native messaging instead of HTTP:
- See [Native Messaging Setup Guide](docs/NATIVE_MESSAGING.md)

### Try the Context Menu

1. Select some text on any webpage
2. Right-click
3. Click "Save with selected text"
4. Bookmark is saved instantly with the selected text as notes!

### Explore the Features

- **Auto-save:** Save bookmarks while reading
- **Tag system:** Organize with multiple tags
- **Code snippets:** Save code examples with syntax highlighting
- **Smart queue:** Never lose bookmarks even when offline
- **Real-time validation:** Get instant feedback on form inputs

## Keyboard Shortcuts (Optional)

You can add keyboard shortcuts in Chrome:
1. Go to `chrome://extensions/shortcuts`
2. Find "Bookmark Manager"
3. Set a shortcut like `Ctrl+Shift+B`

## Troubleshooting

### "Desktop app unavailable" (Red Dot)

**Check if server is running:**
```bash
curl http://localhost:8765/health
```

Expected response: `{"status": "ok", "message": "Desktop app is running"}`

If connection refused:
- Make sure you started the Python server
- Check for errors in the server terminal
- Try restarting the server

### Extension Not Loading

**Chrome:**
- Check for errors on `chrome://extensions/` page
- Click "Errors" button if present
- Reload the extension

**Firefox:**
- Check `about:debugging` for error messages
- Reload the extension

### Form Validation Errors

- **URL:** Must start with `http://` or `https://`
- **Title:** Minimum 3 characters required
- **Tags:** Max 20 tags, each max 50 characters
- **Notes:** Max 1000 characters
- **Code:** Max 5000 characters

### Database Issues

**Can't find database:**
```bash
ls -la ~/.bookmarks/
```

**Reset database (WARNING: Deletes all bookmarks):**
```bash
rm ~/.bookmarks/bookmarks.db
# Restart the desktop app to recreate it
```

**View all bookmarks:**
```bash
sqlite3 ~/.bookmarks/bookmarks.db "SELECT * FROM bookmarks;"
```

## Getting Help

- Read the [Full Documentation](README.md)
- Check the [Testing Guide](docs/TESTING.md)
- Review the [API Documentation](docs/API.md)

## Common Use Cases

### 1. Research & Learning
- Save articles with relevant quotes in notes
- Tag by topic: `javascript`, `python`, `machine-learning`
- Store code examples in snippets

### 2. Code References
- Save Stack Overflow answers with code snippets
- Tag by language and problem type
- Add notes about when to use each solution

### 3. Quick Bookmarking
- Use context menu for instant saves
- Works offline - sync later
- No need to organize immediately

## Performance Tips

- Queue processes automatically every 30 seconds
- Large code snippets (up to 5000 chars) are fine
- Database can handle thousands of bookmarks
- Extension uses minimal memory when closed

## Next Steps

Once you're comfortable with the basics:

1. **Read the Architecture:** Learn how the extension works internally
2. **Set Up Native Messaging:** More secure for production use
3. **Customize the UI:** Modify CSS in `extensions/shared/css/popup.css`
4. **Add Features:** The codebase is modular and easy to extend

---

**Congratulations!** 🎉 You're now ready to use the Bookmark Manager extensions!

Save this page as a bookmark to test it out! 😉
