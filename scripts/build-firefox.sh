#!/bin/bash
# Build script for Firefox extension

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/build"
FIREFOX_BUILD="$BUILD_DIR/firefox"

echo "Building Firefox extension..."

rm -rf "$FIREFOX_BUILD"
mkdir -p "$FIREFOX_BUILD"

cp "$PROJECT_ROOT/extensions/firefox/manifest.json" "$FIREFOX_BUILD/"

cp -r "$PROJECT_ROOT/extensions/firefox/icons" "$FIREFOX_BUILD/"

mkdir -p "$FIREFOX_BUILD/shared"
cp -r "$PROJECT_ROOT/extensions/shared/html" "$FIREFOX_BUILD/shared/"
cp -r "$PROJECT_ROOT/extensions/shared/css" "$FIREFOX_BUILD/shared/"
cp -r "$PROJECT_ROOT/extensions/shared/js" "$FIREFOX_BUILD/shared/"

echo "Firefox extension built successfully at: $FIREFOX_BUILD"
echo ""
echo "To load in Firefox:"
echo "1. Open about:debugging#/runtime/this-firefox"
echo "2. Click 'Load Temporary Add-on'"
echo "3. Select the manifest.json file in: $FIREFOX_BUILD"
echo ""
echo "To create a distributable package:"
echo "cd $FIREFOX_BUILD && zip -r ../firefox-extension.zip *"
