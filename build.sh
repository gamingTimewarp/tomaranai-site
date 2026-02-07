#!/bin/bash
# build.sh — Master build script for TOMARANAI PROJECT
# Usage: bash build.sh

set -e

echo "=========================================="
echo "  TOMARANAI PROJECT - Build System"
echo "=========================================="
echo ""

# Generate JavaScript config
echo "1. Generating JavaScript config..."
bash generate-js-config.sh
echo ""

# Generate content pages and manifest
echo "2. Generating content pages..."
bash generate-pages.sh
echo ""

# Generate robots.txt
echo "3. Generating robots.txt..."
bash generate-robots.sh
echo ""

# Generate sitemap.xml
echo "4. Generating sitemap.xml..."
bash generate-sitemap.sh
echo ""

# Generate RSS/Atom feeds
echo "5. Generating RSS/Atom feeds..."
bash generate-feeds.sh
echo ""

# Generate archive pages
echo "6. Generating archive pages..."
bash generate-archives.sh
echo ""

# Generate tags page
echo "7. Generating tags page..."
bash generate-tags-page.sh
echo ""

echo "=========================================="
echo "  Build Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  - Content pages: $(ls stories/*.html blog/*.html projects/*.html 2>/dev/null | wc -l)"
echo "  - Manifest entries: $(jq '[.stories[], .blog[], .projects[]] | length' content-manifest.json 2>/dev/null || echo 0)"
echo "  - Archive pages: $(ls archives/*.html 2>/dev/null | wc -l)"
echo "  - Sitemap URLs: $(grep -c '<loc>' sitemap.xml 2>/dev/null || echo 0)"
echo "  - RSS items: $(grep -c '<item>' feed.rss 2>/dev/null || echo 0)"
echo "  - Atom entries: $(grep -c '<entry>' feed.atom 2>/dev/null || echo 0)"
echo "  - JavaScript config: js/config.js"
echo "  - Tags page: tags.html"
echo "=========================================="
