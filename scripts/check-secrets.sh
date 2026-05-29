#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

EXCLUDE=":!scripts/check-secrets.sh :!package-lock.json :!*.md :!.env.example"

PATTERNS=(
  'sk-proj-[A-Za-z0-9]'
  'GOCSPX-[A-Za-z0-9]{10,}'
  'sand_[a-f0-9-]{20,}'
)

FOUND=0
for pat in "${PATTERNS[@]}"; do
  if git grep -E "$pat" -- $EXCLUDE 2>/dev/null; then
    echo "FAIL: pattern matched: $pat" >&2
    FOUND=1
  fi
done

if [[ "$FOUND" -ne 0 ]]; then
  exit 1
fi
echo "OK: no secret patterns in tracked source"
