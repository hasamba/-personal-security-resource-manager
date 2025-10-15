#!/bin/bash
# Install native messaging host for both Chrome and Firefox

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
NATIVE_HOST_SCRIPT="$PROJECT_ROOT/desktop-host/native-host.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "Native Messaging Host Installer"
echo "======================================"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: python3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python 3 found"

# Detect OS
OS="$(uname -s)"
case "$OS" in
    Linux*)     OS_TYPE=Linux;;
    Darwin*)    OS_TYPE=Mac;;
    CYGWIN*)    OS_TYPE=Windows;;
    MINGW*)     OS_TYPE=Windows;;
    *)          OS_TYPE="UNKNOWN"
esac

echo -e "${GREEN}✓${NC} Detected OS: $OS_TYPE"

# Get Chrome extension ID
echo ""
echo "Please enter your Chrome extension ID:"
echo "(Find it at chrome://extensions/ with Developer mode enabled)"
read -p "Extension ID: " CHROME_EXT_ID

if [ -z "$CHROME_EXT_ID" ]; then
    echo -e "${YELLOW}Warning: No Chrome extension ID provided, skipping Chrome setup${NC}"
    INSTALL_CHROME=false
else
    INSTALL_CHROME=true
fi

# Ask about Firefox
echo ""
read -p "Install for Firefox? (y/n): " INSTALL_FIREFOX_PROMPT
if [[ "$INSTALL_FIREFOX_PROMPT" =~ ^[Yy]$ ]]; then
    INSTALL_FIREFOX=true
else
    INSTALL_FIREFOX=false
fi

# Create temporary manifest files with correct paths
TEMP_DIR=$(mktemp -d)
CHROME_MANIFEST="$TEMP_DIR/com.bookmarkmanager.native-chrome.json"
FIREFOX_MANIFEST="$TEMP_DIR/com.bookmarkmanager.native-firefox.json"

if [ "$INSTALL_CHROME" = true ]; then
    cat > "$CHROME_MANIFEST" <<EOF
{
  "name": "com.bookmarkmanager.native",
  "description": "Native messaging host for Bookmark Manager",
  "path": "$NATIVE_HOST_SCRIPT",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://${CHROME_EXT_ID}/"
  ]
}
EOF
fi

if [ "$INSTALL_FIREFOX" = true ]; then
    cat > "$FIREFOX_MANIFEST" <<EOF
{
  "name": "com.bookmarkmanager.native",
  "description": "Native messaging host for Bookmark Manager",
  "path": "$NATIVE_HOST_SCRIPT",
  "type": "stdio",
  "allowed_extensions": [
    "bookmarkmanager@example.com"
  ]
}
EOF
fi

# Install based on OS
echo ""
echo "Installing native messaging host..."

if [ "$OS_TYPE" = "Linux" ]; then
    # Linux installation
    if [ "$INSTALL_CHROME" = true ]; then
        # Try Chrome first, then Chromium
        CHROME_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
        CHROMIUM_DIR="$HOME/.config/chromium/NativeMessagingHosts"
        
        mkdir -p "$CHROME_DIR"
        cp "$CHROME_MANIFEST" "$CHROME_DIR/com.bookmarkmanager.native.json"
        echo -e "${GREEN}✓${NC} Installed for Chrome: $CHROME_DIR"
        
        if [ -d "$HOME/.config/chromium" ]; then
            mkdir -p "$CHROMIUM_DIR"
            cp "$CHROME_MANIFEST" "$CHROMIUM_DIR/com.bookmarkmanager.native.json"
            echo -e "${GREEN}✓${NC} Installed for Chromium: $CHROMIUM_DIR"
        fi
    fi
    
    if [ "$INSTALL_FIREFOX" = true ]; then
        FIREFOX_DIR="$HOME/.mozilla/native-messaging-hosts"
        mkdir -p "$FIREFOX_DIR"
        cp "$FIREFOX_MANIFEST" "$FIREFOX_DIR/com.bookmarkmanager.native.json"
        echo -e "${GREEN}✓${NC} Installed for Firefox: $FIREFOX_DIR"
    fi

elif [ "$OS_TYPE" = "Mac" ]; then
    # macOS installation
    if [ "$INSTALL_CHROME" = true ]; then
        CHROME_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
        mkdir -p "$CHROME_DIR"
        cp "$CHROME_MANIFEST" "$CHROME_DIR/com.bookmarkmanager.native.json"
        echo -e "${GREEN}✓${NC} Installed for Chrome: $CHROME_DIR"
    fi
    
    if [ "$INSTALL_FIREFOX" = true ]; then
        FIREFOX_DIR="$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
        mkdir -p "$FIREFOX_DIR"
        cp "$FIREFOX_MANIFEST" "$FIREFOX_DIR/com.bookmarkmanager.native.json"
        echo -e "${GREEN}✓${NC} Installed for Firefox: $FIREFOX_DIR"
    fi

elif [ "$OS_TYPE" = "Windows" ]; then
    echo -e "${YELLOW}Windows detected${NC}"
    echo "For Windows, you need to create registry entries manually."
    echo "See docs/NATIVE_MESSAGING.md for instructions."
    echo ""
    echo "Manifest files created in: $TEMP_DIR"
    echo "Chrome manifest: $CHROME_MANIFEST"
    echo "Firefox manifest: $FIREFOX_MANIFEST"
    exit 0

else
    echo -e "${RED}Unknown operating system${NC}"
    exit 1
fi

# Make native host script executable
chmod +x "$NATIVE_HOST_SCRIPT"
echo -e "${GREEN}✓${NC} Made native host script executable"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "======================================"
echo -e "${GREEN}Installation complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Restart your browser"
echo "2. Open the extension popup"
echo "3. Check for green status indicator (connected via native messaging)"
echo ""
echo "To test the native host manually:"
echo "  echo '{\"type\":\"ping\"}' | python3 $NATIVE_HOST_SCRIPT"
echo ""
echo "To uninstall, delete the manifest files:"
if [ "$INSTALL_CHROME" = true ]; then
    if [ "$OS_TYPE" = "Linux" ]; then
        echo "  rm ~/.config/google-chrome/NativeMessagingHosts/com.bookmarkmanager.native.json"
    elif [ "$OS_TYPE" = "Mac" ]; then
        echo "  rm ~/Library/Application\\ Support/Google/Chrome/NativeMessagingHosts/com.bookmarkmanager.native.json"
    fi
fi
if [ "$INSTALL_FIREFOX" = true ]; then
    if [ "$OS_TYPE" = "Linux" ]; then
        echo "  rm ~/.mozilla/native-messaging-hosts/com.bookmarkmanager.native.json"
    elif [ "$OS_TYPE" = "Mac" ]; then
        echo "  rm ~/Library/Application\\ Support/Mozilla/NativeMessagingHosts/com.bookmarkmanager.native.json"
    fi
fi
echo ""
