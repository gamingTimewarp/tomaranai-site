# TOMARANAI PROJECT - Build Scripts

This directory contains all the shell scripts used to generate and maintain the website. All scripts should be run from the project root directory.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Scripts](#core-scripts)
3. [Generation Scripts](#generation-scripts)
4. [Usage Examples](#usage-examples)

---

## Quick Start

```bash
# Create a new post
bash scripts/new-post.sh

# Build entire site
bash scripts/build.sh

# Update and push to git
bash scripts/update.sh
```

---

## Core Scripts

### `build.sh`
**Purpose:** Master build script that regenerates the entire site

**Usage:**
```bash
bash scripts/build.sh
```

**What it does:**
1. Generates `js/config.js` from `config.json`
2. Generates content pages and `content-manifest.json`
3. Generates `robots.txt`
4. Generates `sitemap.xml`
5. Generates RSS and Atom feeds
6. Generates archive pages by date
7. Generates tags page
8. Shows summary statistics

**When to use:**
- After modifying `config.json`
- After manually editing content files
- When you need to regenerate everything
- Before deploying to production

**Output:**
- `js/config.js`
- `stories.html`, `blog.html`, `projects.html`
- `content-manifest.json`
- `robots.txt`
- `sitemap.xml`
- `feed.rss`, `feed.atom`
- `archives/*.html`
- `tags.html`

---

### `new-post.sh`
**Purpose:** Interactive script to create new stories, blog posts, or projects

**Usage:**
```bash
bash scripts/new-post.sh
```

**Interactive prompts:**
1. **Type:** Choose stories, blog, or projects
2. **Title:** Enter the post title
3. **Date:** Enter date (format: "January 2026") or press Enter for current month
4. **Tags:** Enter comma-separated tags (optional)
5. **Series:** Enter series name if part of a series (optional)
6. **Content:** Paste your content, then type `END` on a new line

**What it does:**
1. Creates HTML file in appropriate subdirectory
2. Adds metadata (title, date, tags, series, reading time)
3. Includes all necessary scripts and styles
4. Automatically runs `build.sh` to update manifest and pages
5. Shows confirmation with file location

**Example:**
```bash
bash scripts/new-post.sh

# Follow prompts:
# Type: stories
# Title: The Adventure Begins
# Date: February 2026
# Tags: Sci-Fi, Adventure
# Series: Space Chronicles
# Content: [paste your story]
# END
```

**Output:**
- New HTML file in `stories/`, `blog/`, or `projects/`
- Updated `content-manifest.json`
- Updated list pages
- Updated feeds, sitemap, archives, etc.

---

### `update.sh`
**Purpose:** Git workflow script to commit and push changes

**Usage:**
```bash
bash scripts/update.sh
```

**What it does:**
1. Shows current git status
2. Prompts for commit message
3. Stages all changes (`git add .`)
4. Commits with your message
5. Pushes to `origin main`
6. Confirms success or shows error

**When to use:**
- After making changes you want to deploy
- To push local changes to GitHub
- To deploy to production (if using GitHub Pages)

**Note:** This does NOT run `build.sh` - make sure to build first if needed!

---

## Generation Scripts

These scripts are called automatically by `build.sh`, but can be run individually if needed.

### `generate-js-config.sh`
**Purpose:** Generates JavaScript config from `config.json`

**Usage:**
```bash
bash scripts/generate-js-config.sh
```

**What it does:**
- Reads `config.json`
- Creates `js/config.js` with `window.SiteConfig` object
- Makes config settings available to JavaScript

**When to use:**
- After modifying `config.json`
- When config values aren't updating in browser

**Output:** `js/config.js`

---

### `generate-pages.sh`
**Purpose:** Generates list pages and content manifest

**Usage:**
```bash
bash scripts/generate-pages.sh
```

**What it does:**
1. Scans `stories/`, `blog/`, `projects/` directories
2. Extracts metadata from each HTML file:
   - Title
   - Date
   - Tags
   - Series
   - Excerpt
   - Word count
   - Reading time
3. Generates `stories.html`, `blog.html`, `projects.html`
4. Creates `content-manifest.json` with all metadata

**When to use:**
- After adding/editing content files
- When list pages are out of date
- When manifest is missing or corrupted

**Output:**
- `stories.html`
- `blog.html`
- `projects.html`
- `content-manifest.json`

---

### `generate-robots.sh`
**Purpose:** Generates `robots.txt` for search engines

**Usage:**
```bash
bash scripts/generate-robots.sh
```

**What it does:**
- Reads base URL from `config.json`
- Creates `robots.txt` with sitemap reference
- Allows all crawlers

**When to use:**
- After changing base URL in `config.json`
- If `robots.txt` is missing

**Output:** `robots.txt`

**Content example:**
```
User-agent: *
Allow: /

Sitemap: https://tomaranai.pro/sitemap.xml
```

---

### `generate-sitemap.sh`
**Purpose:** Generates XML sitemap for search engines

**Usage:**
```bash
bash scripts/generate-sitemap.sh
```

**What it does:**
1. Reads content from `content-manifest.json`
2. Converts dates to ISO 8601 format
3. Generates `sitemap.xml` with all pages:
   - Homepage (priority: 1.0)
   - List pages (priority: 0.9)
   - Content pages (priority: 0.7)

**When to use:**
- After adding/removing content
- After changing URLs
- Before submitting to Google Search Console

**Output:** `sitemap.xml`

---

### `generate-feeds.sh`
**Purpose:** Generates RSS and Atom feeds

**Usage:**
```bash
bash scripts/generate-feeds.sh
```

**What it does:**
1. Reads content from `content-manifest.json`
2. Combines stories and blog posts
3. Sorts by date (newest first)
4. Takes top 20 items
5. Generates both RSS 2.0 and Atom 1.0 feeds

**When to use:**
- After adding new content
- When feed readers show old content
- Before announcing new posts

**Output:**
- `feed.rss` (RSS 2.0 format)
- `feed.atom` (Atom 1.0 format)

**Note:** Projects are excluded from feeds (stories and blog only)

---

### `generate-archives.sh`
**Purpose:** Generates archive pages organized by date

**Usage:**
```bash
bash scripts/generate-archives.sh
```

**What it does:**
1. Reads content from `content-manifest.json`
2. Groups content by year and month
3. Generates archive pages in `archives/` directory
4. Each page shows content from that time period

**When to use:**
- After adding content with new dates
- When archive pages are missing
- To update archive navigation

**Output:**
- `archives/YYYY-month.html` (e.g., `archives/2026-february.html`)
- `archives/coming-soon.html` (for unreleased content)

**Example pages:**
- `archives/2026-february.html`
- `archives/2025-october.html`
- `archives/2024-march.html`

---

### `generate-tags-page.sh`
**Purpose:** Generates the all-tags browsing page

**Usage:**
```bash
bash scripts/generate-tags-page.sh
```

**What it does:**
1. Reads content from `content-manifest.json`
2. Collects all unique tags
3. Counts posts per tag
4. Generates `tags.html` with tag cloud

**When to use:**
- After adding new tags to content
- When tags page is out of date
- To update tag counts

**Output:** `tags.html`

---

## Usage Examples

### Complete Workflow: Adding New Content

```bash
# Step 1: Create new post
bash scripts/new-post.sh
# (build.sh runs automatically)

# Step 2: Preview locally
# Open the generated file in your browser

# Step 3: Push to production
bash scripts/update.sh
# Enter commit message: "Add new story: The Adventure Begins"
```

---

### Fixing Broken Manifest

```bash
# Regenerate manifest and pages
bash scripts/generate-pages.sh

# Or regenerate everything
bash scripts/build.sh
```

---

### Updating After Config Changes

```bash
# Edit config.json
nano config.json

# Rebuild site with new config
bash scripts/build.sh

# Push changes
bash scripts/update.sh
```

---

### Regenerating Individual Components

```bash
# Just update feeds
bash scripts/generate-feeds.sh

# Just update sitemap
bash scripts/generate-sitemap.sh

# Just update archives
bash scripts/generate-archives.sh

# Or update everything
bash scripts/build.sh
```

---

### Emergency Rebuild

```bash
# If something breaks, rebuild everything
bash scripts/build.sh

# Check git status to see what changed
git status

# If good, commit and push
git add -A
git commit -m "Rebuild site"
git push origin main
```

---

## File Dependencies

Understanding what reads what:

```
config.json
  ↓
  ├─→ generate-js-config.sh → js/config.js
  ├─→ generate-robots.sh → robots.txt
  ├─→ generate-sitemap.sh → sitemap.xml
  ├─→ generate-feeds.sh → feed.rss, feed.atom
  └─→ generate-pages.sh → stories.html, blog.html, projects.html

content files (stories/*.html, blog/*.html, projects/*.html)
  ↓
  generate-pages.sh
  ↓
  content-manifest.json
  ↓
  ├─→ generate-sitemap.sh → sitemap.xml
  ├─→ generate-feeds.sh → feed.rss, feed.atom
  ├─→ generate-archives.sh → archives/*.html
  └─→ generate-tags-page.sh → tags.html
```

---

## Common Issues

### Issue: "command not found"
**Solution:** Run from project root, not from scripts directory
```bash
# Wrong
cd scripts
bash build.sh

# Correct
bash scripts/build.sh
```

---

### Issue: Manifest out of date
**Solution:** Regenerate with `generate-pages.sh` or `build.sh`
```bash
bash scripts/build.sh
```

---

### Issue: New content not showing
**Solution:** Check if build ran successfully
```bash
# Rebuild
bash scripts/build.sh

# Check manifest
cat content-manifest.json | jq .
```

---

### Issue: Tags not updating
**Solution:** Regenerate tags page
```bash
bash scripts/generate-tags-page.sh
# or
bash scripts/build.sh
```

---

## Script Locations

All scripts must be run from project root:

```
tomaranai-site/              ← Run scripts from here
├── scripts/
│   ├── build.sh
│   ├── new-post.sh
│   ├── update.sh
│   ├── generate-*.sh
│   └── README.md            ← You are here
├── stories/
├── blog/
├── projects/
└── config.json
```

---

## Getting Help

For issues or questions:
- Check this README
- Check `~/.claude/projects/-home-awright-tomaranai-site/memory/MEMORY.md`
- Review the Build System section in project memory
- Check script output for error messages

---

**Last Updated:** February 2026
**Maintained By:** @gamingTimewarp
