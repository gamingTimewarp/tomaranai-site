#!/bin/bash
# new-post.sh — Generate a story or blog post page from a plain .txt file
# Usage: Run this from inside your my-site folder
#        bash new-post.sh

echo "-------------------------------------------"
echo "  New Post Generator"
echo "-------------------------------------------"
echo ""

# --- Ask what type of post ---
echo "What type of post is this?"
echo "  1) Story"
echo "  2) Blog Post"
read -p "  Enter 1 or 2: " type

if [ "$type" != "1" ] && [ "$type" != "2" ]; then
    echo "Invalid choice. Exiting."
    exit 1
fi

# --- Ask for the text file ---
read -p "  Path to your .txt file: " txtfile

if [ ! -f "$txtfile" ]; then
    echo "File not found: $txtfile"
    exit 1
fi

# --- Ask for metadata ---
read -p "  Post title: " title
read -p "  Output filename (no .html, e.g. story-my-story): " filename

if [ "$type" == "1" ]; then
    read -p "  Series name (or leave blank): " series
    tag="Sci-Fi"
    tag_class="card-tag"
    back_page="stories.html"
    back_label="← Back to Stories"
else
    tag="Satire"
    tag_class="card-tag card-tag--blog"
    back_page="blog.html"
    back_label="← Back to Blog"
    series=""
fi

read -p "  Date (e.g. January 2026): " date

echo ""
echo "-------------------------------------------"
echo "  Processing..."
echo "-------------------------------------------"

# --- Build the byline block ---
byline=""
if [ -n "$series" ]; then
    byline="<span class=\"story-series\">$series</span>"$'\n'"        <span class=\"story-date\">$date</span>"
else
    byline="<span class=\"story-date\">$date</span>"
fi

# --- Process the text file into HTML paragraphs ---
# Logic:
#   - Split on blank lines to get paragraphs
#   - Within each paragraph, if a line starts with a quote mark (" or '),
#     or is a line of dialogue/narration mixed in, join lines with <br>
#     (CSS will auto-style these as dialogue blocks)
#   - Otherwise, join lines into a single <p> block

body=""
current_para=""

process_paragraph() {
    local para="$1"
    if [ -z "$para" ]; then
        return
    fi

    # Check if any line in the paragraph starts with a quote character
    has_dialogue=false
    while IFS= read -r line; do
        trimmed=$(echo "$line" | sed 's/^[[:space:]]*//')
        if [[ "$trimmed" == \"* ]] || [[ "$trimmed" == \'* ]] || [[ "$trimmed" == \u201c* ]]; then
            has_dialogue=true
            break
        fi
    done <<< "$para"

    if [ "$has_dialogue" == true ]; then
        # Dialogue block: join lines with <br>
        joined=$(echo "$para" | sed '/^$/d' | sed 's/$/\n/' | tr '\n' '§' | sed 's/§$//' | sed 's/§/<br>\n      /g')
        body+="      <p>$joined</p>"$'\n\n'
    else
        # Narration block: collapse into single paragraph
        joined=$(echo "$para" | sed '/^$/d' | tr '\n' ' ' | sed 's/  */ /g' | sed 's/^ //;s/ $//')
        body+="      <p>$joined</p>"$'\n\n'
    fi
}

# Read the file, splitting on blank lines
while IFS= read -r line || [ -n "$line" ]; do
    if [ -z "$(echo "$line" | tr -d '[:space:]')" ]; then
        # Blank line = end of paragraph
        process_paragraph "$current_para"
        current_para=""
    else
        if [ -n "$current_para" ]; then
            current_para+=$'\n'"$line"
        else
            current_para="$line"
        fi
    fi
done < "$txtfile"

# Process any remaining paragraph
process_paragraph "$current_para"

# --- Write the HTML file ---
cat > "${filename}.html" << HTMLEOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title} — TOMARANAI PROJECT</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Playfair+Display:ital,wght@0,700;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>
<body>

  <!-- ===== NAVIGATION ===== -->
  <nav class="nav">
    <a href="index.html" class="nav-logo">YourName.</a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="stories.html"$([ "$type" == "1" ] && echo ' class="active"')>Stories</a></li>
      <li><a href="blog.html"$([ "$type" == "2" ] && echo ' class="active"')>Blog</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </nav>

  <!-- ===== POST ===== -->
  <article class="story-post">
    <header class="story-header">
      <a href="${back_page}" class="story-back">${back_label}</a>
      <span class="${tag_class}">${tag}</span>
      <h1 class="story-title">${title}</h1>
      <div class="story-byline">
        ${byline}
      </div>
    </header>

    <div class="story-body">

${body}
    </div>

    <!-- Feedback CTA -->
    <div class="story-feedback">
      <p>Enjoyed this one? Hated it? Let me know.</p>
      <a href="contact.html" class="story-feedback-link">Leave feedback →</a>
    </div>

  </article>

</body>
</html>
HTMLEOF

echo ""
echo "-------------------------------------------"
echo "  Done! Created: ${filename}.html"
echo "-------------------------------------------"
echo ""
echo "  Don't forget to add a card for this post"
echo "  on stories.html or blog.html!"
echo "-------------------------------------------"
