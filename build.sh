#!/bin/bash
# build.sh — Master build script for TOMARANAI PROJECT
# Usage: bash build.sh

set -e

echo "=========================================="
echo "  TOMARANAI PROJECT - Build System"
echo "=========================================="
echo ""

# Generate content pages and manifest
echo "1. Generating content pages..."
bash generate-pages.sh
echo ""

# Generate robots.txt
echo "2. Generating robots.txt..."
bash generate-robots.sh
echo ""

# Generate sitemap.xml
echo "3. Generating sitemap.xml..."
bash generate-sitemap.sh
echo ""

# Generate RSS/Atom feeds
echo "4. Generating RSS/Atom feeds..."
bash generate-feeds.sh
echo ""

echo "=========================================="
echo "  Build Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Content pages: $(ls stories/*.html blog/*.html projects/*.html 2>/dev/null | wc -l)"
echo "  - Manifest entries: $(jq '[.stories[], .blog[], .projects[]] | length' content-manifest.json 2>/dev/null || echo 0)"
echo "  - Sitemap URLs: $(grep -c '<loc>' sitemap.xml 2>/dev/null || echo 0)"
echo "  - RSS items: $(grep -c '<item>' feed.rss 2>/dev/null || echo 0)"
echo "  - Atom entries: $(grep -c '<entry>' feed.atom 2>/dev/null || echo 0)"
echo "=========================================="
