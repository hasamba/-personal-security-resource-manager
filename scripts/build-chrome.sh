#!/bin/bash
# Build script for Chrome extension

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
CHROME_BUILD="$BUILD_DIR/chrome"

echo "Building Chrome extension..."

rm -rf "$CHROME_BUILD"
mkdir -p "$CHROME_BUILD"

cp "$PROJECT_ROOT/extensions/chrome/manifest.json" "$CHROME_BUILD/"

cp -r "$PROJECT_ROOT/extensions/chrome/icons" "$CHROME_BUILD/"

mkdir -p "$CHROME_BUILD/shared"
cp -r "$PROJECT_ROOT/extensions/shared/html" "$CHROME_BUILD/shared/"
cp -r "$PROJECT_ROOT/extensions/shared/css" "$CHROME_BUILD/shared/"
cp -r "$PROJECT_ROOT/extensions/shared/js" "$CHROME_BUILD/shared/"

echo "Chrome extension built successfully at: $CHROME_BUILD"
echo ""
echo "To load in Chrome:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode'"
echo "3. Click 'Load unpacked'"
echo "4. Select the directory: $CHROME_BUILD"
