#!/bin/bash
# update.sh - Update Claude Enterprise MCP to latest version

set -e

INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude-enterprise}"

echo "======================================"
echo "Claude Enterprise MCP Update"
echo "======================================"
echo ""

# Check if installed
if [ ! -d "$INSTALL_DIR" ]; then
    echo "Error: Claude Enterprise MCP not installed."
    echo "Run setup.sh first."
    exit 1
fi

cd "$INSTALL_DIR"

# Get current version
CURRENT_VERSION=$(git describe --tags --abbrev=0 2>/dev/null || echo "unknown")
echo "Current version: $CURRENT_VERSION"

# Fetch latest
echo "Fetching updates..."
git fetch origin main --tags

# Check for breaking changes
LATEST_VERSION=$(git describe --tags --abbrev=0 origin/main 2>/dev/null || echo "unknown")
echo "Latest version: $LATEST_VERSION"

# Compare major versions
CURRENT_MAJOR=$(echo "$CURRENT_VERSION" | cut -d '.' -f 1 | tr -d 'v')
LATEST_MAJOR=$(echo "$LATEST_VERSION" | cut -d '.' -f 1 | tr -d 'v')

if [ "$LATEST_MAJOR" != "$CURRENT_MAJOR" ] && [ "$LATEST_MAJOR" != "unknown" ]; then
    echo ""
    echo "⚠️  BREAKING CHANGE DETECTED"
    echo "Major version upgrade: $CURRENT_MAJOR → $LATEST_MAJOR"
    echo ""
    echo "Please review the migration guide:"
    echo "  $INSTALL_DIR/docs/upgrade-guide.md"
    echo ""
    read -p "Continue with upgrade? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Update cancelled."
        exit 0
    fi
fi

# Pull latest
echo "Pulling latest changes..."
git pull origin main

# Reinstall dependencies (in case of changes)
echo "Updating dependencies..."
npm install

# Rebuild
echo "Rebuilding packages..."
npm run build

# Reconfigure Claude Code (in case of changes)
echo "Updating Claude Code configuration..."
./scripts/configure-claude.sh

echo ""
echo "======================================"
echo "Update Complete!"
echo "======================================"
echo "Updated from $CURRENT_VERSION to $LATEST_VERSION"
echo ""
