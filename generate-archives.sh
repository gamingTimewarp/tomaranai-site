#!/bin/bash
# generate-archives.sh — Generate year/month archive pages
# Usage: bash generate-archives.sh

set -e

echo "Generating archive pages..."

# Check if feature is enabled
if [ -f "config.json" ]; then
    ENABLED=$(jq -r '.features.archivePages // true' config.json)
    if [ "$ENABLED" != "true" ]; then
        echo "  Archive pages disabled in config.json"
        exit 0
    fi
fi

# Create archives directory
mkdir -p archives

# Get site config
BASE_URL="https://tomaranai.pro"
SITE_TITLE="TOMARANAI PROJECT"
if [ -f "config.json" ]; then
    BASE_URL=$(jq -r '.site.baseUrl' config.json)
    SITE_TITLE=$(jq -r '.site.title' config.json)
fi

# Extract all unique year-month combinations from manifest
if [ ! -f "content-manifest.json" ]; then
    echo "  Error: content-manifest.json not found"
    exit 1
fi

# Get all dates and sort
declare -A year_months
jq -r '[.stories[], .blog[], .projects[]] | .[].date' content-manifest.json | while read date; do
    # Handle special case: "Coming Soon"
    if [ "$date" == "Coming Soon" ]; then
        echo "coming-soon|Coming Soon"
        continue
    fi

    month=$(echo "$date" | awk '{print $1}')
    year=$(echo "$date" | awk '{print $NF}')
    echo "${year}|${month}"
done | sort -u | while IFS='|' read year month; do
    # Create archive page for this year-month
    # Handle special case for "Coming Soon"
    if [ "$year" == "coming-soon" ]; then
        filename="archives/coming-soon.html"
        display_date="Coming Soon"
        page_title="Coming Soon"
    else
        filename="archives/${year}-${month,,}.html"
        display_date="${month} ${year}"
        page_title="${month} ${year}"
    fi

    # Generate page
    cat > "$filename" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="../redirect.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${page_title} Archives — ${SITE_TITLE}</title>
  <link rel="canonical" href="${BASE_URL}/${filename}" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css" />
  <script src="../js/config.js"></script>
</head>
<body>

  <!-- ===== NAVIGATION ===== -->
  <nav class="nav">
    <a href="../ject.html" class="nav-logo"><ruby>止まらない<rt>TOMARANAI</rt></ruby> PROJECT</a>
    <button class="nav-hamburger" onclick="document.querySelector('.nav-links').classList.toggle('nav-open')" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav-links">
      <li><a href="../ject.html">Home</a></li>
      <li><a href="../stories.html">Stories</a></li>
      <li><a href="../blog.html">Blog</a></li>
      <li><a href="../projects.html">Projects</a></li>
      <li><a href="../contact.html">Contact</a></li>
    </ul>
  </nav>

  <!-- ===== PAGE HEADER ===== -->
  <header class="page-header">
    <div class="page-header-label">Archives</div>
    <h1 class="page-header-title">${page_title}</h1>
    <p class="page-header-sub">Browse content from ${page_title}</p>
  </header>

  <!-- ===== CONTENT ===== -->
  <main class="content">
    <div class="card-grid card-grid--single" data-archive-date="${display_date}">
      <!-- Content loaded dynamically -->
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

  <script src="../includes.js"></script>
  <script src="../js/archive-loader.js"></script>
</body>
</html>
EOF

    echo "  ✓ Generated ${filename}"
done

echo "  ✓ Archive pages generated"
