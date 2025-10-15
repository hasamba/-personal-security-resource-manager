# Native Messaging Setup Guide

This guide explains how to set up native messaging between the browser extensions and the desktop host application.

## Overview

Native messaging allows the browser extension to communicate with a native application (Python script) via stdin/stdout. This is more secure than HTTP but requires additional setup.

## Prerequisites

- Python 3.7 or higher
- Browser extension installed
- Administrative/sudo access (for some installation steps)

## Installation Steps

### 1. Get Extension ID

#### Chrome

1. Load the extension in Chrome (`chrome://extensions/`)
2. Enable "Developer mode"
3. Find your extension and copy its ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

#### Firefox

The extension ID is predefined in the manifest: `bookmarkmanager@example.com`

### 2. Update Native Host Configuration

#### For Chrome

Edit `desktop-host/native-host.json`:

```json
{
  "name": "com.bookmarkmanager.native",
  "description": "Native messaging host for Bookmark Manager",
  "path": "/absolute/path/to/native-host.py",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://YOUR_EXTENSION_ID_HERE/"
  ]
}
```

Replace:
- `/absolute/path/to/native-host.py` with the full path to `native-host.py`
- `YOUR_EXTENSION_ID_HERE` with your extension's ID

#### For Firefox

Edit `desktop-host/native-host-firefox.json`:

```json
{
  "name": "com.bookmarkmanager.native",
  "description": "Native messaging host for Bookmark Manager",
  "path": "/absolute/path/to/native-host.py",
  "type": "stdio",
  "allowed_extensions": [
    "bookmarkmanager@example.com"
  ]
}
```

Replace `/absolute/path/to/native-host.py` with the full path to `native-host.py`.

### 3. Install Native Host Manifest

The manifest file must be placed in a specific location depending on your OS and browser.

#### Linux

**Chrome:**
```bash
# System-wide
sudo mkdir -p /etc/opt/chrome/native-messaging-hosts/
sudo cp desktop-host/native-host.json /etc/opt/chrome/native-messaging-hosts/com.bookmarkmanager.native.json

# Or user-specific
mkdir -p ~/.config/google-chrome/NativeMessagingHosts/
cp desktop-host/native-host.json ~/.config/google-chrome/NativeMessagingHosts/com.bookmarkmanager.native.json
```

**Chromium:**
```bash
# User-specific
mkdir -p ~/.config/chromium/NativeMessagingHosts/
cp desktop-host/native-host.json ~/.config/chromium/NativeMessagingHosts/com.bookmarkmanager.native.json
```

**Firefox:**
```bash
# System-wide
sudo mkdir -p /usr/lib/mozilla/native-messaging-hosts/
sudo cp desktop-host/native-host-firefox.json /usr/lib/mozilla/native-messaging-hosts/com.bookmarkmanager.native.json

# Or user-specific
mkdir -p ~/.mozilla/native-messaging-hosts/
cp desktop-host/native-host-firefox.json ~/.mozilla/native-messaging-hosts/com.bookmarkmanager.native.json
```

#### macOS

**Chrome:**
```bash
# System-wide
sudo mkdir -p /Library/Google/Chrome/NativeMessagingHosts/
sudo cp desktop-host/native-host.json /Library/Google/Chrome/NativeMessagingHosts/com.bookmarkmanager.native.json

# Or user-specific
mkdir -p ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/
cp desktop-host/native-host.json ~/Library/Application\ Support/Google/Chrome/NativeMessagingHosts/com.bookmarkmanager.native.json
```

**Firefox:**
```bash
# System-wide
sudo mkdir -p /Library/Application\ Support/Mozilla/NativeMessagingHosts/
sudo cp desktop-host/native-host-firefox.json /Library/Application\ Support/Mozilla/NativeMessagingHosts/com.bookmarkmanager.native.json

# Or user-specific
mkdir -p ~/Library/Application\ Support/Mozilla/NativeMessagingHosts/
cp desktop-host/native-host-firefox.json ~/Library/Application\ Support/Mozilla/NativeMessagingHosts/com.bookmarkmanager.native.json
```

#### Windows

**Chrome:**
Create a registry entry:

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.bookmarkmanager.native]
@="C:\\path\\to\\native-host.json"
```

Or system-wide:
```reg
[HKEY_LOCAL_MACHINE\Software\Google\Chrome\NativeMessagingHosts\com.bookmarkmanager.native]
@="C:\\path\\to\\native-host.json"
```

**Firefox:**
```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\Software\Mozilla\NativeMessagingHosts\com.bookmarkmanager.native]
@="C:\\path\\to\\native-host-firefox.json"
```

### 4. Make Script Executable

```bash
chmod +x desktop-host/native-host.py
```

For Windows, ensure the Python script has the correct shebang or call it via `python.exe`.

### 5. Test Native Messaging

#### Manual Test

You can test the native host directly:

```bash
echo '{"type":"ping"}' | python3 desktop-host/native-host.py
```

Expected output (binary format, but should include):
```
{"type": "pong", "success": true}
```

#### Browser Test

1. Open your browser
2. Load the extension
3. Open the popup
4. Check the connection status indicator
   - Green dot = Connected via native messaging
   - Yellow/Orange = Checking connection
   - Red = Offline

5. Try saving a bookmark
6. Check the log file: `/tmp/bookmark-native-host.log`

## Troubleshooting

### Connection Issues

**Check manifest location:**
```bash
# Chrome (Linux)
cat ~/.config/google-chrome/NativeMessagingHosts/com.bookmarkmanager.native.json

# Firefox (Linux)
cat ~/.mozilla/native-messaging-hosts/com.bookmarkmanager.native.json
```

**Verify paths are absolute:**
```bash
# The path in the manifest must be absolute
grep "path" ~/.config/google-chrome/NativeMessagingHosts/com.bookmarkmanager.native.json
```

**Check script permissions:**
```bash
ls -l desktop-host/native-host.py
# Should show: -rwxr-xr-x
```

**Check logs:**
```bash
tail -f /tmp/bookmark-native-host.log
```

### Extension ID Mismatch

If you see "Specified native messaging host not found" in Chrome:

1. Verify extension ID in `chrome://extensions/`
2. Check it matches the ID in `native-host.json`
3. Ensure the ID ends with a forward slash: `chrome-extension://ID/`

### Permission Denied

If you see permission errors:

```bash
# Make script executable
chmod +x desktop-host/native-host.py

# Check Python interpreter
which python3

# Update shebang if needed
head -1 desktop-host/native-host.py
```

### Python Module Issues

If the script fails to import modules:

```bash
# Test the script directly
python3 desktop-host/native-host.py <<< '{"type":"ping"}'

# Install missing modules
pip3 install --user sqlite3  # Usually included in Python
```

### Browser Console Errors

1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Look for messages like:
   - "Error when communicating with the native messaging host"
   - "Native host has exited"

Common fixes:
- Ensure manifest path is absolute
- Verify extension ID is correct
- Check native host script is executable
- Review native host logs

## Advantages of Native Messaging

- ✅ More secure (no network exposure)
- ✅ Direct process communication
- ✅ Better for production deployments
- ✅ No CORS issues

## When to Use HTTP Instead

- 🔧 Easier for development/testing
- 🔧 Works across network (if needed)
- 🔧 Simpler debugging
- 🔧 No installation steps

## Security Considerations

1. **Extension ID**: Only specified extensions can connect
2. **Host Path**: Must be absolute to prevent hijacking
3. **Permissions**: Script should not run as root/admin
4. **Validation**: Always validate incoming messages
5. **Logs**: Don't log sensitive user data

## Advanced Configuration

### Custom Database Location

Edit `native-host.py`:

```python
DB_PATH = Path('/custom/path/to/bookmarks.db')
```

### Change Log Location

Edit `native-host.py`:

```python
logging.basicConfig(
    filename='/custom/path/to/logs/native-host.log',
    # ...
)
```

### Multiple Extensions

To allow multiple extensions to use the same host, add multiple origins:

```json
{
  "allowed_origins": [
    "chrome-extension://extension-id-1/",
    "chrome-extension://extension-id-2/"
  ]
}
```

## Migration from HTTP

If you're currently using HTTP and want to switch to native messaging:

1. Install native messaging host (follow steps above)
2. The extension will automatically prefer native messaging
3. Falls back to HTTP if native messaging fails
4. You can stop the HTTP server once native messaging works

## References

- [Chrome Native Messaging Documentation](https://developer.chrome.com/docs/apps/nativeMessaging/)
- [Firefox Native Messaging Documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging)
