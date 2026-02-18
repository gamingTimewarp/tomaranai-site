#!/bin/bash
# generate-pages.sh — Auto-generate blog.html, stories.html, and projects.html
# Usage: bash generate-pages.sh

set -e

echo "-------------------------------------------"
echo "  Generating content pages and manifest..."
echo "-------------------------------------------"

# Initialize JSON manifest
echo '{' > content-manifest.json
echo '  "stories": [],' >> content-manifest.json
echo '  "blog": [],' >> content-manifest.json
echo '  "projects": []' >> content-manifest.json
echo '}' >> content-manifest.json

# Function to add item to JSON manifest
add_to_manifest() {
    local category="$1"
    local filepath="$2"
    local title="$3"
    local date="$4"
    local tags="$5"
    local excerpt="$6"
    local read_text="$7"
    local word_count="$8"
    local reading_time="$9"
    local series="${10}"

    # Convert tabs in tags to array format
    local tags_json="["
    local first=true
    while IFS=$'\t' read -ra TAG_ARRAY; do
        for tag in "${TAG_ARRAY[@]}"; do
            if [ -n "$tag" ]; then
                if [ "$first" = true ]; then
                    first=false
                else
                    tags_json+=","
                fi
                tags_json+="\"$(echo "$tag" | sed 's/"/\\"/g')\""
            fi
        done
    done <<< "$tags"
    tags_json+="]"

    # Escape quotes and special characters for JSON
    title=$(echo "$title" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
    excerpt=$(echo "$excerpt" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
    series=$(echo "$series" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')

    # Create JSON object with series (may be empty string)
    local json_obj="{\"path\":\"$filepath\",\"title\":\"$title\",\"date\":\"$date\",\"tags\":$tags_json,\"excerpt\":\"$excerpt\",\"readText\":\"$read_text\",\"wordCount\":$word_count,\"readingTime\":$reading_time,\"series\":\"$series\"}"

    # Read current manifest
    local temp_manifest=$(cat content-manifest.json)

    # Insert into appropriate array
    temp_manifest=$(echo "$temp_manifest" | jq ".${category} += [$json_obj]")

    # Write back
    echo "$temp_manifest" > content-manifest.json
}

# Function to extract metadata from an HTML file
extract_metadata() {
    local file="$1"
    local temp_title temp_date temp_tags temp_series temp_excerpt temp_read_text

    # Extract title from <h1 class="story-title">
    temp_title=$(grep -oP '(?<=<h1 class="story-title">).*?(?=</h1>)' "$file" | head -1 | sed 's/<[^>]*>//g')

    # Extract date from <span class="story-date">
    temp_date=$(grep -oP '(?<=<span class="story-date">).*?(?=</span>)' "$file" | head -1)

    # Extract all tags from <span class="card-tag"> (use TAB as separator)
    temp_tags=$(grep -oP '<span class="card-tag[^"]*">.*?</span>' "$file" | sed 's/<[^>]*>//g' | tr '\n' '\t')

    # Extract series from <span class="story-series">
    temp_series=$(grep -oP '(?<=<span class="story-series">).*?(?=</span>)' "$file" | head -1 || echo "")

    # Extract first substantial paragraph from story-body as excerpt
    # Skip very short paragraphs and get the first one with at least 50 chars
    # Clean it by removing line breaks, multiple spaces, and HTML tags
    temp_excerpt=""
    while IFS= read -r para; do
        cleaned=$(echo "$para" | sed 's/<[^>]*>//g' | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        if [ ${#cleaned} -ge 50 ]; then
            temp_excerpt=$(echo "$cleaned" | cut -c1-200)
            if [ ${#temp_excerpt} -ge 195 ]; then
                temp_excerpt="${temp_excerpt}..."
            fi
            break
        fi
    done < <(grep -A 100 '<div class="story-body">' "$file" | grep -oP '(?<=<p>).*?(?=</p>)')

    # If no excerpt found, use a placeholder
    if [ -z "$temp_excerpt" ]; then
        temp_excerpt="Click to read more."
    fi

    # Determine read text based on file type
    if echo "$file" | grep -qE "blog/|whois-"; then
        temp_read_text="Read post →"
    elif echo "$temp_tags" | grep -qi "poetry\|poem"; then
        temp_read_text="Read poem →"
    else
        temp_read_text="Read story →"
    fi

    # Output as pipe-delimited string (using special delimiter sequence)
    echo "${temp_title}|||${temp_date}|||${temp_tags}|||${temp_series}|||${temp_excerpt}|||${temp_read_text}"
}

# Function to parse date into sortable format (YYYYMM)
parse_date_for_sort() {
    local date_str="$1"
    local month year

    # Extract month and year
    month=$(echo "$date_str" | awk '{print $1}')
    year=$(echo "$date_str" | awk '{print $NF}')

    # Convert month name to number
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
        *) month="00" ;;
    esac

    echo "${year}${month}"
}

# Function to calculate reading time
calculate_reading_time() {
    local file="$1"
    local wpm=200
    if [ -f "config.json" ]; then
        wpm=$(jq -r '.readingTime.wordsPerMinute // 200' config.json)
    fi

    # Count words in story-body section
    local word_count=$(grep -A 10000 '<div class="story-body">' "$file" | \
                       grep -B 10000 '</div>' | head -n -1 | \
                       sed 's/<[^>]*>//g' | wc -w)

    # Calculate reading time (round up)
    local reading_time=$(( (word_count + wpm - 1) / wpm ))
    if [ "$reading_time" -lt 1 ]; then reading_time=1; fi

    echo "${word_count}|${reading_time}"
}

# Function to generate JSON-LD structured data
generate_jsonld() {
    local type="$1"
    local title="$2"
    local description="$3"
    local url="$4"
    local date="$5"
    local author="${6:-@gamingTimewarp}"
    local word_count="${7:-0}"

    if [ -f "config.json" ]; then
        local enabled=$(jq -r '.features.jsonLd // true' config.json)
        if [ "$enabled" != "true" ]; then echo ""; return; fi
    fi

    # Escape quotes for JSON
    title=$(echo "$title" | sed 's/"/\\"/g')
    description=$(echo "$description" | sed 's/"/\\"/g')

    if [ "$type" == "Article" ]; then
        cat << EOF
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "url": "${url}",
    "datePublished": "${date}",
    "author": {
      "@type": "Person",
      "name": "${author}"
    },
    "wordCount": ${word_count}
  }
  </script>
EOF
    else
        cat << EOF
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "${title}",
    "description": "${description}",
    "url": "${url}"
  }
  </script>
EOF
    fi
}

# Function to generate social meta tags
generate_social_meta() {
    local title="$1"
    local description="$2"
    local url="$3"
    local type="$4"
    local image="${5:-https://tomaranai.pro/og-image.png}"

    if [ -f "config.json" ]; then
        local enabled=$(jq -r '.features.socialMetaTags // true' config.json)
        if [ "$enabled" != "true" ]; then echo ""; return; fi

        # Get default image from config
        local default_image=$(jq -r '.seo.defaultImage // "https://tomaranai.pro/og-image.png"' config.json)
        if [ "$image" == "https://tomaranai.pro/og-image.png" ]; then
            image="$default_image"
        fi
    fi

    # Escape quotes in text
    title=$(echo "$title" | sed 's/"/\&quot;/g')
    description=$(echo "$description" | sed 's/"/\&quot;/g')

    cat << EOF
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:image" content="${image}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
EOF
}

# Function to generate a card article block
generate_card() {
    local filepath="$1"
    local title="$2"
    local date="$3"
    local tags="$4"
    local excerpt="$5"
    local read_text="$6"
    local is_blog="$7"

    # Extract just the filename from the path
    local filename=$(basename "$filepath")

    # Generate tag HTML (using TAB as separator)
    local tags_html=""
    while IFS=$'\t' read -ra TAG_ARRAY; do
        for tag in "${TAG_ARRAY[@]}"; do
            if [ -n "$tag" ]; then
                if [ "$is_blog" == "true" ]; then
                    tags_html+="<span class=\"card-tag card-tag--blog\">$tag</span>"
                else
                    tags_html+="<span class=\"card-tag\">$tag</span>"
                fi
            fi
        done
    done <<< "$tags"

    # Generate card HTML with subdirectory path
    cat << CARD_EOF

      <article class="card">
        <div class="card-meta">
          ${tags_html}
          <span class="card-date">${date}</span>
        </div>
        <h3 class="card-title"><a href="${filepath}">${title}</a></h3>
        <p class="card-excerpt">${excerpt}</p>
        <a href="${filepath}" class="card-read">${read_text}</a>
      </article>
CARD_EOF
}

# Function to generate a full page
generate_page() {
    local page_type="$1"  # "stories", "blog", or "projects"
    local pattern="$2"    # file pattern like "story-*.html"
    local output_file="$3"
    local page_title="$4"
    local page_label="$5"
    local page_subtitle="$6"
    local is_blog="$7"

    # Collect all matching files and their metadata
    declare -A files_data
    declare -a sorted_files

    for file in $pattern; do
        if [ -f "$file" ]; then
            metadata=$(extract_metadata "$file")
            date=$(echo "$metadata" | cut -d'|' -f2)
            sort_key=$(parse_date_for_sort "$date")
            files_data["$file"]="$metadata"
            sorted_files+=("${sort_key}|${file}")
        fi
    done

    # Sort files by date (newest first)
    IFS=$'\n' sorted_files=($(sort -rn <<< "${sorted_files[*]}"))
    unset IFS

    # Generate cards HTML and add to manifest
    cards_html=""
    for entry in "${sorted_files[@]}"; do
        file=$(echo "$entry" | cut -d'|' -f2)
        metadata="${files_data[$file]}"

        # Parse metadata using special delimiter
        title=$(echo "$metadata" | cut -d'|' -f1)
        date=$(echo "$metadata" | cut -d'|' -f4)
        tags=$(echo "$metadata" | cut -d'|' -f7)
        series=$(echo "$metadata" | cut -d'|' -f10)
        excerpt=$(echo "$metadata" | cut -d'|' -f13)
        read_text=$(echo "$metadata" | cut -d'|' -f16)

        # Calculate reading time
        reading_data=$(calculate_reading_time "$file")
        word_count=$(echo "$reading_data" | cut -d'|' -f1)
        reading_time=$(echo "$reading_data" | cut -d'|' -f2)

        cards_html+=$(generate_card "$file" "$title" "$date" "$tags" "$excerpt" "$read_text" "$is_blog")

        # Add to JSON manifest
        add_to_manifest "$page_type" "$file" "$title" "$date" "$tags" "$excerpt" "$read_text" "$word_count" "$reading_time" "$series"
    done

    # Get base URL from config
    BASE_URL="https://tomaranai.pro"
    SITE_TITLE="TOMARANAI PROJECT"
    SITE_DESCRIPTION="Short sci-fi fiction, satire, and projects by @gamingTimewarp"
    if [ -f "config.json" ]; then
        BASE_URL=$(jq -r '.site.baseUrl' config.json)
        SITE_TITLE=$(jq -r '.site.title' config.json)
        SITE_DESCRIPTION=$(jq -r '.site.description' config.json)
    fi

    # Generate social meta tags
    social_meta=$(generate_social_meta "${page_title} — TOMARANAI PROJECT" "${page_subtitle}" "${BASE_URL}/${output_file}" "website")

    # Generate JSON-LD structured data
    jsonld=$(generate_jsonld "WebPage" "${page_title} — TOMARANAI PROJECT" "${page_subtitle}" "${BASE_URL}/${output_file}")

    # Generate the full HTML page
    cat > "$output_file" << PAGE_EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="js/redirect.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${page_title} — TOMARANAI PROJECT</title>
  <meta name="description" content="${page_subtitle}" />
  <link rel="canonical" href="${BASE_URL}/${output_file}" />
${social_meta}
${jsonld}
  <link rel="alternate" type="application/rss+xml" title="${SITE_TITLE} RSS Feed" href="${BASE_URL}/feed.rss" />
  <link rel="alternate" type="application/atom+xml" title="${SITE_TITLE} Atom Feed" href="${BASE_URL}/feed.atom" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="css/dark-mode.css" />
  <script src="js/config.js"></script>
  <script src="js/dark-mode.js"></script>
</head>
<body>

  <!-- ===== NAVIGATION ===== -->
  <nav class="nav">
    <a href="ject.html" class="nav-logo"><ruby>
            止まらない<rt>TOMARANAI</rt>
        </ruby> PROJECT</a>
    <button class="nav-hamburger" onclick="document.querySelector('.nav-links').classList.toggle('nav-open')" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav-links">
      <li><a href="ject.html">Home</a></li>
      <li><a href="stories.html"$([ "$page_type" == "stories" ] && echo ' class="active"')>Stories</a></li>
      <li><a href="blog.html"$([ "$page_type" == "blog" ] && echo ' class="active"')>Blog</a></li>
      <li><a href="projects.html"$([ "$page_type" == "projects" ] && echo ' class="active"')>Projects</a></li>
      <li><a href="portfolio.html">Hire Me</a></li>
    </ul>
  </nav>

  <!-- ===== PAGE HEADER ===== -->
  <header class="page-header">
    <div class="page-header-label">${page_label}</div>
    <h1 class="page-header-title">${page_title}</h1>
    <p class="page-header-sub">${page_subtitle}</p>
  </header>

  <!-- ===== ${page_title^^} LIST ===== -->
  <main class="content">
    <div class="card-grid card-grid--single">
      <!-- Content loaded dynamically by list-content.js -->
    </div>
  </main>

  <!-- ===== FOOTER ===== -->
  <footer class="footer">
    <div class="footer-newsletter">
      <span class="footer-newsletter-label">Subscribe to updates</span>
      <form
        action="https://buttondown.com/api/emails/embed-subscribe/gamingTimewarp"
        method="post"
        target="popupwindow"
        onsubmit="window.open('https://buttondown.com/gamingTimewarp', 'popupwindow')"
        class="newsletter-form"
      >
        <input type="email" name="email" placeholder="your@email.com" required />
        <button type="submit">Subscribe</button>
      </form>
    </div>
    <div class="footer-bottom">
      <p class="footer-text">© 2026 @gamingTimewarp. Built with HTML, CSS, and an unhealthy amount of stimulants.</p>
      <div class="footer-links">
        <a href="https://github.com/gamingTimewarp" target="_blank">GitHub</a>
        <a href="mailto:gamingTimewarp@tomaranai.pro">Email</a>
      </div>
    </div>
  </footer>

  <script src="js/includes.js"></script>
  <script src="js/list-content.js"></script>
</body>
</html>
PAGE_EOF

    echo "  ✓ Generated ${output_file}"
}

# Generate each page
generate_page "stories" "stories/story-*.html" "stories.html" "Stories" "The Fiction" "Short sci-fi fiction. Weird, funny, and occasionally coherent." "false"
generate_page "blog" "blog/blog-*.html blog/whois-*.html" "blog.html" "Blog" "Opinions & Observations" "Satire, musings, and the occasional mathematical rambling." "true"
generate_page "projects" "projects/project-*-landing.html" "projects.html" "Projects" "Downloadable Projects" "Other projects that you can download and use locally." "false"

echo "  ✓ Generated content-manifest.json"
echo "-------------------------------------------"
echo "  Done! All pages and manifest generated."
echo "-------------------------------------------"
