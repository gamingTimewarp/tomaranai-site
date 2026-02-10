#!/usr/bin/env bash
# generate-css.sh — concatenate css/src/*.css → style.css with selector verification
# Run from project root: bash scripts/generate-css.sh

set -euo pipefail

SRC_DIR="css/src"
OUT="style.css"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# ── 1. Write header comment ────────────────────────────────────────────────────
cat > "$OUT" <<EOF
/* =====================================================================
   style.css — DO NOT EDIT DIRECTLY
   Generated from css/src/ by scripts/generate-css.sh
   Last built: ${TIMESTAMP}
   To modify styles, edit the files in css/src/ and run:
     bash scripts/build.sh
   ===================================================================== */

EOF

# ── 2. Concatenate source files in order ──────────────────────────────────────
for f in \
  "${SRC_DIR}/00-layers.css" \
  "${SRC_DIR}/01-base.css" \
  "${SRC_DIR}/02-layout.css" \
  "${SRC_DIR}/03-components.css" \
  "${SRC_DIR}/04-content.css" \
  "${SRC_DIR}/05-forms.css" \
  "${SRC_DIR}/06-utilities.css"
do
  if [[ ! -f "$f" ]]; then
    echo "ERROR: Source file not found: $f" >&2
    exit 1
  fi
  echo "/* ----- $(basename "$f") ----- */" >> "$OUT"
  cat "$f" >> "$OUT"
  echo "" >> "$OUT"
done

# ── 3. Selector verification ───────────────────────────────────────────────────
# Extract class/id selectors from source files and generated output.
# Any selector present in src but absent from output is an error.

TMP_SRC=$(mktemp)
TMP_OUT=$(mktemp)
trap "rm -f $TMP_SRC $TMP_OUT" EXIT

grep -oh '\.[a-zA-Z][a-zA-Z0-9_-]*\|#[a-zA-Z][a-zA-Z0-9_-]*' \
  "${SRC_DIR}"/*.css 2>/dev/null | sort -u > "$TMP_SRC"

grep -oh '\.[a-zA-Z][a-zA-Z0-9_-]*\|#[a-zA-Z][a-zA-Z0-9_-]*' \
  "$OUT" 2>/dev/null | sort -u > "$TMP_OUT"

MISSING=$(comm -23 "$TMP_SRC" "$TMP_OUT")

if [[ -n "$MISSING" ]]; then
  echo "ERROR: The following selectors are in css/src/ but missing from $OUT:" >&2
  echo "$MISSING" >&2
  exit 1
fi

# ── 4. Report success ─────────────────────────────────────────────────────────
LINE_COUNT=$(wc -l < "$OUT")
SRC_COUNT=$(wc -l "$TMP_SRC" | awk '{print $1}')
echo "   ✓ style.css generated (${LINE_COUNT} lines, ${SRC_COUNT} unique selectors)"
