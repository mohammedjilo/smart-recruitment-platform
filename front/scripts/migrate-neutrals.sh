#!/usr/bin/env bash
# تحويل آلي لألوان Tailwind المحايدة إلى الـ tokens (بدون قرارات، تحويل 1:1).
#
# الاستخدام:
#   bash scripts/migrate-neutrals.sh --dry                 عدّ فقط، بدون تعديل
#   bash scripts/migrate-neutrals.sh                       تنفيذ على src كامل
#   bash scripts/migrate-neutrals.sh src/features/user     تنفيذ على مجلد محدد
#   bash scripts/migrate-neutrals.sh --brand src/features/user
#        (يضيف أيضاً: bg-violet-50/100 → bg-primary-tint ، 600 → bg-primary ، 700 → bg-primary-dark)
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

# ملفات لا نلمسها (ألوان دلالية أو تخص Auth أو تعريف الـ tokens نفسه)
EXCLUDE='(^|/)theme/|status\.ts|statusStyles\.ts|ApplicationStatusChip|EmploymentTypeChip|EmploymentTypeBadge|notificationItem\.utils|companyNotificationItem\.utils|CustomCard'

# أمان: لا تعمل إلا على تعديلات محفوظة (commit) حتى يسهل التراجع
if [ "$DRY" -eq 0 ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if [ -n "$(git status --porcelain -- "$TARGET")" ]; then
    echo "عندك تعديلات غير محفوظة في $TARGET. اعمل commit أولاً ثم أعد التشغيل."
    exit 1
  fi
fi

read -r -d '' PERL <<'EOF' || true
use strict; use warnings;
my $dry = $ENV{DRY};
my @map = (
  # نصوص
  ['text-(?:slate|gray)-(?:400|500|600)',          'text-muted'],
  ['text-(?:slate|gray)-(?:700|800|900)',          'text-content'],
  # حدود
  ['border-(?:slate|gray)-(?:100|200)',            'border-border'],
  ['border-blue-100',                              'border-border'],
  ['divide-(?:slate|gray)-(?:100|200)',            'divide-border'],
  ['ring-(?:slate|gray)-(?:100|200)',              'ring-border'],
  # خلفيات
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
  echo "لا يوجد شيء للتحويل."
else
  echo "$RESULT" | sort -rn | head -40
  FILES=$(echo "$RESULT" | wc -l)
  TOTAL=$(echo "$RESULT" | awk -F'\t' '{s+=$1} END{print s}')
  if [ "$DRY" -eq 1 ]; then
    echo "--- (تجربة فقط) $TOTAL استبدال في $FILES ملف، لم يتم تعديل شيء ---"
  else
    echo "--- تم: $TOTAL استبدال في $FILES ملف ---"
  fi
fi

echo
echo "--- المتبقي ويحتاج قراراً (أعلى 25) ---"
grep -rhoE "(text|bg|border|ring)-(violet|purple|indigo|blue)-[0-9]{2,3}|mui-(blue|purple)[a-z0-9-]*|#[0-9A-Fa-f]{6}\b" "$TARGET" \
  --include=*.tsx --include=*.ts 2>/dev/null | sort | uniq -c | sort -rn | head -25 || true