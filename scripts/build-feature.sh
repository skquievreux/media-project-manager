#!/bin/bash

# Media Project Manager - Feature Integration Script

echo "🚀 Starting Feature Integration..."

# 1. Build
echo "📦 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting."
    exit 1
fi

# 2. Add changes
echo "➕ Adding changes to Git..."
git add .

# 3. Commit (if there are changes)
if git diff-index --quiet HEAD --; then
    echo "ℹ️ No changes to commit."
else
    echo "💾 Committing changes..."
    # Use a default message if none provided
    MSG="${1:-Auto-integration of feature}"
    git commit -m "$MSG"
fi

# 4. Push
echo "⬆️ Pushing to remote..."
git push origin main --tags

echo "✅ Integration complete!"
