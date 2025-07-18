#!/bin/bash

# Release script for @biolink/react-native-biolink

set -e

echo "🚀 Preparing release for @gmemmy/react-native-biolink"

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the package directory."
    exit 1
fi

CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"

echo "🔍 Running pre-release checks..."
pnpm run ci

if git tag -l | grep -q "v$CURRENT_VERSION"; then
    echo "⚠️  Warning: Tag v$CURRENT_VERSION already exists"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Release cancelled"
        exit 1
    fi
fi

echo "🏷️  Creating tag v$CURRENT_VERSION..."
git tag "v$CURRENT_VERSION"
git push origin "v$CURRENT_VERSION"

echo "✅ Release tag v$CURRENT_VERSION created and pushed!"
echo "📋 The GitHub Actions release workflow will automatically publish to npm."
echo "🔗 Check the workflow status at: https://github.com/gmemmy/react-native-biolink/actions" 