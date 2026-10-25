#!/usr/bin/env bash
# Automatically map neutral Tailwind colors to tokens without judgment (1:1).
#
# Usage:
#   bash scripts/migrate-neutrals.sh --dry                 Count only; make no changes.
#   bash scripts/migrate-neutrals.sh                       Process all of src.
#   bash scripts/migrate-neutrals.sh src/features/user     Process a specific directory.
#   bash scripts/migrate-neutrals.sh --brand src/features/user
#        (Also maps bg-violet-50/100 to bg-primary-tint, 600 to bg-primary, and 700 to bg-primary-dark.)
set -euo pipefail

DRY=0
BRAND=0
ARGS=()
for a in "$@"; do
  case "$a" in
    --dry) DRY=1 ;;
    --brand) BRAND=1 ;;
    *) ARGS+=("$a") ;;
  esac
done
TARGET="${ARGS[0]:-src}"
export DRY BRAND

# Files to exclude (semantic colors, Auth-specific colors, or token definitions).
EXCLUDE='(^|/)theme/|status\.ts|statusStyles\.ts|ApplicationStatusChip|EmploymentTypeChip|EmploymentTypeBadge|notificationItem\.utils|companyNotificationItem\.utils|CustomCard'

# Safety: run only on committed changes so they can be reverted easily.
if [ "$DRY" -eq 0 ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain -- "$TARGET")" ]; then
    echo "Uncommitted changes exist in $TARGET. Commit them before running this script."
    exit 1
  fi
fi

read -r -d '' PERL <<'EOF' || true
use strict; use warnings;
my $dry = $ENV{DRY};
my @map = (
  # Text.
  ['text-(?:slate|gray)-(?:400|500|600)',          'text-muted'],
  ['text-(?:slate|gray)-(?:700|800|900)',          'text-content'],
  # Borders.
  ['border-(?:slate|gray)-(?:100|200)',            'border-border'],
  ['border-blue-100',                              'border-border'],
  ['divide-(?:slate|gray)-(?:100|200)',            'divide-border'],
  ['ring-(?:slate|gray)-(?:100|200)',              'ring-border'],
  # Backgrounds.
  ['bg-(?:slate|gray)-50',                         'bg-bg'],
  ['bg-white',                                     'bg-surface'],
);
if ($ENV{BRAND}) {
  push @map,
    ['bg-violet-(?:50|100)', 'bg-primary-tint'],
    ['bg-violet-600',        'bg-primary'],
    ['bg-violet-700',        'bg-primary-dark'];
}
my $file = shift @ARGV;
open(my $in, '<:raw', $file) or die "cannot read $file";
local $/;
my $out = <$in>;
close $in;
my $n = 0;
for my $p (@map) {
  my ($re, $to) = @$p;
  my $c = ($out =~ s/(?<![\w-])$re(?![\w-])/$to/g) || 0;
  $n += $c;
}
if ($n) {
  print "$n\t$file\n";
  unless ($dry) {
    open(my $o, '>:raw', $file) or die "cannot write $file";
    print $o $out;
    close $o;
  }
}
EOF

RESULT=$(find "$TARGET" -type f \( -name '*.ts' -o -name '*.tsx' \) \
  | { grep -Ev "$EXCLUDE" || true; } \
  | while IFS= read -r f; do perl -e "$PERL" "$f"; done)

if [ -z "$RESULT" ]; then
  echo "Nothing to convert."
else
  echo "$RESULT" | sort -rn | head -40
  FILES=$(echo "$RESULT" | wc -l)
  TOTAL=$(echo "$RESULT" | awk -F'\t' '{s+=$1} END{print s}')
  if [ "$DRY" -eq 1 ]; then
    echo "--- (Dry run) $TOTAL replacements in $FILES files; no files were changed ---"
  else
    echo "--- Done: $TOTAL replacements in $FILES files ---"
  fi
fi

echo
echo "--- Remaining items requiring a decision (top 25) ---"
grep -rhoE "(text|bg|border|ring)-(violet|purple|indigo|blue)-[0-9]{2,3}|mui-(blue|purple)[a-z0-9-]*|#[0-9A-Fa-f]{6}\b" "$TARGET" \
  --include=*.tsx --include=*.ts 2>/dev/null | sort | uniq -c | sort -rn | head -25 || true