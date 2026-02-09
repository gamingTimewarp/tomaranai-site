#!/bin/bash
# generate-js-config.sh — Generate JavaScript config from config.json
# Usage: bash generate-js-config.sh

set -e

echo "Generating js/config.js..."

# Create js directory if it doesn't exist
mkdir -p js

# Check if config.json exists
if [ ! -f "config.json" ]; then
    echo "  Warning: config.json not found, using defaults"
    cat > js/config.js << 'EOF'
// config.js — Site configuration for JavaScript
window.SiteConfig = {
  features: {},
  search: { enabled: false },
  relatedPosts: { count: 3, minCommonTags: 1 },
  comments: { provider: 'giscus' },
  darkMode: { defaultTheme: 'auto' },
  socialShare: { platforms: [] }
};
EOF
    echo "  ✓ Generated js/config.js (defaults)"
    exit 0
fi

# Generate JavaScript config from JSON
cat > js/config.js << 'HEADER'
// config.js — Site configuration for JavaScript
// Auto-generated from config.json - DO NOT EDIT MANUALLY
window.SiteConfig =
HEADER

# Append the entire config as JSON
jq '.' config.json >> js/config.js

# Add semicolon
echo ";" >> js/config.js

echo "  ✓ Generated js/config.js"
