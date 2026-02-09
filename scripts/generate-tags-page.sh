#!/bin/bash
# generate-tags-page.sh — Generate tags index page
# Usage: bash generate-tags-page.sh

set -e

echo "Generating tags page..."

# Check if feature is enabled
if [ -f "config.json" ]; then
    ENABLED=$(jq -r '.features.tagsPage // true' config.json)
    if [ "$ENABLED" != "true" ]; then
        echo "  Tags page disabled in config.json"
        exit 0
    fi
fi

# Get site config
BASE_URL="https://tomaranai.pro"
SITE_TITLE="TOMARANAI PROJECT"
if [ -f "config.json" ]; then
    BASE_URL=$(jq -r '.site.baseUrl' config.json)
    SITE_TITLE=$(jq -r '.site.title' config.json)
fi

# Check if manifest exists
if [ ! -f "content-manifest.json" ]; then
    echo "  Error: content-manifest.json not found"
    exit 1
fi

# Generate tags page
cat > tags.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <script src="js/redirect.js"></script>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
EOF

cat >> tags.html << EOF
  <title>Tags — ${SITE_TITLE}</title>
  <link rel="canonical" href="${BASE_URL}/tags.html" />
EOF

cat >> tags.html << 'EOF'
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
    <a href="ject.html" class="nav-logo"><ruby>止まらない<rt>TOMARANAI</rt></ruby> PROJECT</a>
    <button class="nav-hamburger" onclick="document.querySelector('.nav-links').classList.toggle('nav-open')" aria-label="Toggle menu">
      <span></span>
      <span></span>
      <span></span>
    </button>
    <ul class="nav-links">
      <li><a href="ject.html">Home</a></li>
      <li><a href="stories.html">Stories</a></li>
      <li><a href="blog.html">Blog</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </nav>

  <!-- ===== PAGE HEADER ===== -->
  <header class="page-header">
    <div class="page-header-label">Browse by Topic</div>
    <h1 class="page-header-title">All Tags</h1>
    <p class="page-header-sub">Explore content by category and theme</p>
  </header>

  <!-- ===== TAGS GRID ===== -->
  <main class="content">
    <div id="tags-grid" class="tags-grid">
      <!-- Tags loaded dynamically -->
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
  <script src="js/tags-loader.js"></script>
</body>
</html>
EOF

echo "  ✓ Generated tags.html"
