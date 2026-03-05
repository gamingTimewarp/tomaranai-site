#!/bin/bash
# update.sh — Push changes to your website repo
# Usage: Run this from inside your my-site folder
#        bash update.sh

echo "-------------------------------------------"
echo "  Checking for changes..."
echo "-------------------------------------------"

# Show what's changed
git status

# If nothing to commit, exit early
if git diff-index --quiet HEAD -- && [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo ""
    echo "Nothing to commit — your site is up to date!"
    exit 0
fi

echo ""
echo "-------------------------------------------"

# Prompt for a commit message
read -p "  Enter a commit message: " message

# If they left it blank, use a default
if [ -z "$message" ]; then
    message="Update site"
fi

echo "-------------------------------------------"
echo ""

# Stage, commit, and push
git add .
git commit -m "$message"
git push origin main

# Check if the push worked
if [ $? -eq 0 ]; then
    echo ""
    echo "-------------------------------------------"
    echo "  Done! Your site has been updated."
    echo "-------------------------------------------"
else
    echo ""
    echo "-------------------------------------------"
    echo "  Push failed. Check your connection or token."
    echo "-------------------------------------------"
fi
