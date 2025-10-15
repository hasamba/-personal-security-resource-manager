#!/bin/bash
# Build both Chrome and Firefox extensions

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================"
echo "Building All Browser Extensions"
echo "================================"
echo ""

bash "$SCRIPT_DIR/build-chrome.sh"
echo ""

bash "$SCRIPT_DIR/build-firefox.sh"
echo ""

echo "================================"
echo "Build Complete!"
echo "================================"
