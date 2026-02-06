#!/bin/bash
# generate-sitemap.sh — Generate XML sitemap from content-manifest.json
# Usage: bash generate-sitemap.sh

set -e

echo "Generating sitemap.xml..."

BASE_URL="https://tomaranai.pro"
if [ -f "config.json" ]; then
    BASE_URL=$(jq -r '.site.baseUrl' config.json)
    ENABLED=$(jq -r '.features.sitemap // true' config.json)
    if [ "$ENABLED" != "true" ]; then
        echo "  sitemap.xml disabled in config.json"
        exit 0
    fi
fi

# Function to convert "January 2026" to "2026-01-01"
date_to_iso() {
    local date_str="$1"
    local month=$(echo "$date_str" | awk '{print $1}')
    local year=$(echo "$date_str" | awk '{print $NF}')

    case "${month,,}" in
        january) month="01" ;;
        february) month="02" ;;
        march) month="03" ;;
        april) month="04" ;;
        may) month="05" ;;
        june) month="06" ;;
        july) month="07" ;;
        august) month="08" ;;
        september) month="09" ;;
        october) month="10" ;;
        november) month="11" ;;
        december) month="12" ;;
        *) month="01" ;;
    esac

    echo "${year}-${month}-01"
}

# Start sitemap XML
cat > sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
EOF

# Add homepage
cat >> sitemap.xml << EOF
  <url>
    <loc>${BASE_URL}/ject.html</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
EOF

# Add list pages
for page in stories.html blog.html projects.html contact.html; do
    cat >> sitemap.xml << EOF
  <url>
    <loc>${BASE_URL}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
EOF
done

# Add content pages from manifest
if [ -f "content-manifest.json" ]; then
    # Process stories
    jq -r '.stories[] | "\(.path)|\(.date)"' content-manifest.json | while IFS='|' read -r path date; do
        iso_date=$(date_to_iso "$date")
        cat >> sitemap.xml << EOF
  <url>
    <loc>${BASE_URL}/${path}</loc>
    <lastmod>${iso_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
EOF
    done

    # Process blog posts
    jq -r '.blog[] | "\(.path)|\(.date)"' content-manifest.json | while IFS='|' read -r path date; do
        iso_date=$(date_to_iso "$date")
        cat >> sitemap.xml << EOF
  <url>
    <loc>${BASE_URL}/${path}</loc>
    <lastmod>${iso_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
EOF
    done

    # Process projects
    jq -r '.projects[] | "\(.path)|\(.date)"' content-manifest.json | while IFS='|' read -r path date; do
        iso_date=$(date_to_iso "$date")
        cat >> sitemap.xml << EOF
  <url>
    <loc>${BASE_URL}/${path}</loc>
    <lastmod>${iso_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
EOF
    done
fi

# Close sitemap XML
cat >> sitemap.xml << 'EOF'
</urlset>
EOF

echo "  ✓ Generated sitemap.xml"
