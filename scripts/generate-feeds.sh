#!/bin/bash
# generate-feeds.sh — Generate RSS and Atom feeds from content-manifest.json
# Usage: bash generate-feeds.sh

set -e

echo "Generating RSS/Atom feeds..."

# Load config
BASE_URL="https://tomaranai.pro"
SITE_TITLE="TOMARANAI PROJECT"
SITE_DESCRIPTION="Short sci-fi fiction, satire, and projects by @gamingTimewarp"
AUTHOR_NAME="@gamingTimewarp"
AUTHOR_EMAIL="gamingTimewarp@tomaranai.pro"
RSS_ENABLED=true
ATOM_ENABLED=true

if [ -f "config.json" ]; then
    BASE_URL=$(jq -r '.site.baseUrl' config.json)
    SITE_TITLE=$(jq -r '.site.title // "TOMARANAI PROJECT"' config.json)
    SITE_DESCRIPTION=$(jq -r '.site.description' config.json)
    AUTHOR_NAME=$(jq -r '.site.author' config.json)
    AUTHOR_EMAIL=$(jq -r '.site.authorEmail' config.json)
    RSS_ENABLED=$(jq -r '.features.rssFeed // true' config.json)
    ATOM_ENABLED=$(jq -r '.features.atomFeed // true' config.json)
fi

# Function to convert "January 2026" to RFC 822 (RSS) format
date_to_rfc822() {
    local date_str="$1"
    local month=$(echo "$date_str" | awk '{print $1}')
    local year=$(echo "$date_str" | awk '{print $NF}')

    case "${month,,}" in
        january) month="Jan" ;;
        february) month="Feb" ;;
        march) month="Mar" ;;
        april) month="Apr" ;;
        may) month="May" ;;
        june) month="Jun" ;;
        july) month="Jul" ;;
        august) month="Aug" ;;
        september) month="Sep" ;;
        october) month="Oct" ;;
        november) month="Nov" ;;
        december) month="Dec" ;;
        *) month="Jan" ;;
    esac

    echo "01 ${month} ${year} 00:00:00 +0000"
}

# Function to convert "January 2026" to RFC 3339 (Atom) format
date_to_rfc3339() {
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

    echo "${year}-${month}-01T00:00:00Z"
}

# Function to XML escape text
xml_escape() {
    echo "$1" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g; s/'\''/\&apos;/g'
}

# Generate RSS feed
if [ "$RSS_ENABLED" == "true" ]; then
    cat > feed.rss << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
EOF

    cat >> feed.rss << EOF
  <channel>
    <title>$(xml_escape "$SITE_TITLE")</title>
    <link>${BASE_URL}/ject.html</link>
    <description>$(xml_escape "$SITE_DESCRIPTION")</description>
    <language>en-us</language>
    <atom:link href="${BASE_URL}/feed.rss" rel="self" type="application/rss+xml" />
EOF

    # Combine stories and blog, sort by date, take top 20
    if [ -f "content-manifest.json" ]; then
        jq -r '[.stories[], .blog[]] | sort_by(.date) | reverse | .[0:20] | .[] | "\(.path)|\(.title)|\(.date)|\(.excerpt)"' content-manifest.json | while IFS='|' read -r path title date excerpt; do
            rfc822_date=$(date_to_rfc822 "$date")
            title_escaped=$(xml_escape "$title")
            excerpt_escaped=$(xml_escape "$excerpt")

            cat >> feed.rss << EOF
    <item>
      <title>${title_escaped}</title>
      <link>${BASE_URL}/${path}</link>
      <guid>${BASE_URL}/${path}</guid>
      <pubDate>${rfc822_date}</pubDate>
      <description>${excerpt_escaped}</description>
    </item>
EOF
        done
    fi

    cat >> feed.rss << 'EOF'
  </channel>
</rss>
EOF

    echo "  ✓ Generated feed.rss"
fi

# Generate Atom feed
if [ "$ATOM_ENABLED" == "true" ]; then
    UPDATED_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    cat > feed.atom << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
EOF

    cat >> feed.atom << EOF
  <title>$(xml_escape "$SITE_TITLE")</title>
  <link href="${BASE_URL}/ject.html" />
  <link href="${BASE_URL}/feed.atom" rel="self" />
  <id>${BASE_URL}/</id>
  <updated>${UPDATED_DATE}</updated>
  <author>
    <name>$(xml_escape "$AUTHOR_NAME")</name>
    <email>$(xml_escape "$AUTHOR_EMAIL")</email>
  </author>
  <subtitle>$(xml_escape "$SITE_DESCRIPTION")</subtitle>
EOF

    # Combine stories and blog, sort by date, take top 20
    if [ -f "content-manifest.json" ]; then
        jq -r '[.stories[], .blog[]] | sort_by(.date) | reverse | .[0:20] | .[] | "\(.path)|\(.title)|\(.date)|\(.excerpt)"' content-manifest.json | while IFS='|' read -r path title date excerpt; do
            rfc3339_date=$(date_to_rfc3339 "$date")
            title_escaped=$(xml_escape "$title")
            excerpt_escaped=$(xml_escape "$excerpt")

            cat >> feed.atom << EOF
  <entry>
    <title>${title_escaped}</title>
    <link href="${BASE_URL}/${path}" />
    <id>${BASE_URL}/${path}</id>
    <updated>${rfc3339_date}</updated>
    <summary>${excerpt_escaped}</summary>
  </entry>
EOF
        done
    fi

    cat >> feed.atom << 'EOF'
</feed>
EOF

    echo "  ✓ Generated feed.atom"
fi
