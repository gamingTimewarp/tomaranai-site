#!/bin/bash
# generate-robots.sh — Generate robots.txt file
# Usage: bash generate-robots.sh

set -e

echo "Generating robots.txt..."

BASE_URL="https://tomaranai.pro"
if [ -f "config.json" ]; then
    BASE_URL=$(jq -r '.site.baseUrl' config.json)
    ENABLED=$(jq -r '.features.robotsTxt // true' config.json)
    if [ "$ENABLED" != "true" ]; then
        echo "  robots.txt disabled in config.json"
        exit 0
    fi
fi

cat > robots.txt << EOF
User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
EOF

echo "  ✓ Generated robots.txt"
