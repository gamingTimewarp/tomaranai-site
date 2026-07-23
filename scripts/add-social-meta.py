#!/usr/bin/env python3
"""Add Open Graph / Twitter Card meta tags to existing blog and story pages."""

import re
import os
import sys

BASE_URL = "https://tomaranai.pro"
DEFAULT_IMAGE = "https://tomaranai.pro/og-image.png"


def extract_title(html):
    m = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    if m:
        return m.group(1).strip()
    return ""


def extract_description(html):
    # Find the story-body section
    body_match = re.search(r'<div class="story-body">(.*?)(?:</div>|$)', html, re.DOTALL)
    if not body_match:
        return ""
    body = body_match.group(1)

    # Get all <p>...</p> content
    paragraphs = re.findall(r'<p>(.*?)</p>', body, re.DOTALL)
    for para in paragraphs:
        # Strip HTML tags
        clean = re.sub(r'<[^>]+>', '', para)
        # Collapse whitespace
        clean = re.sub(r'\s+', ' ', clean).strip()
        if len(clean) >= 50:
            desc = clean[:200]
            if len(clean) > 200:
                desc += "..."
            # Escape for HTML attribute
            desc = desc.replace('"', '&quot;').replace('<', '&lt;').replace('>', '&gt;')
            return desc
    return ""


def build_meta_block(title, description, url):
    return (
        f'  <meta name="description" content="{description}" />\n'
        f'  <link rel="canonical" href="{url}" />\n'
        f'  <meta property="og:title" content="{title}" />\n'
        f'  <meta property="og:description" content="{description}" />\n'
        f'  <meta property="og:url" content="{url}" />\n'
        f'  <meta property="og:type" content="article" />\n'
        f'  <meta property="og:image" content="{DEFAULT_IMAGE}" />\n'
        f'  <meta name="twitter:card" content="summary_large_image" />\n'
        f'  <meta name="twitter:title" content="{title}" />\n'
        f'  <meta name="twitter:description" content="{description}" />\n'
        f'  <meta name="twitter:image" content="{DEFAULT_IMAGE}" />'
    )


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    if 'og:title' in html:
        print(f"  SKIP (already has OG tags): {filepath}")
        return

    title = extract_title(html)
    description = extract_description(html)

    # Build URL from path relative to site root
    # filepath like /path/to/site/blog/blog-riichi.html
    # We need blog/blog-riichi.html
    rel_parts = []
    parts = filepath.replace('\\', '/').split('/')
    for i, p in enumerate(parts):
        if p in ('blog', 'stories', 'projects'):
            rel_parts = parts[i:]
            break
    url_path = '/'.join(rel_parts)
    url = f"{BASE_URL}/{url_path}"

    meta_block = build_meta_block(title, description, url)

    # Insert after <meta name="viewport" .../>
    viewport_pattern = r'(<meta name="viewport"[^/]*/>\s*)'
    replacement = r'\1' + meta_block + '\n'
    new_html = re.sub(viewport_pattern, replacement, html, count=1)

    if new_html == html:
        print(f"  WARN: Could not find viewport tag in {filepath}")
        return

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_html)

    print(f"  OK: {filepath}")
    print(f"      Title: {title[:60]}")
    print(f"      Desc:  {description[:80]}")


def main():
    site_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    targets = []
    for subdir in ('blog', 'stories'):
        dirpath = os.path.join(site_root, subdir)
        for fname in sorted(os.listdir(dirpath)):
            if fname.endswith('.html'):
                targets.append(os.path.join(dirpath, fname))

    print(f"Processing {len(targets)} files...\n")
    for fp in targets:
        process_file(fp)
    print("\nDone.")


if __name__ == '__main__':
    main()
