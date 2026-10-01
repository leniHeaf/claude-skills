#!/usr/bin/env bash
# Design-Skills für Claude Code mit einem Befehl installieren.
#
#   bash install-skills.sh               -> global für alle Projekte (~/.claude/skills)
#   bash install-skills.sh <projektpfad> -> nur in ein Projekt (<projektpfad>/.claude/skills)
#   bash install-skills.sh --update      -> Skills in diesem Repo auf den neuesten Stand von GitHub bringen
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO_DIR/.claude/skills"

# repo | Pfad im Repo | Name des Skills
SKILLS=(
  "emilkowalski/skill|skills/emil-design-eng|emil-design-eng"
  "emilkowalski/skill|skills/animate|animate"
  "emilkowalski/skill|skills/improve-animations|improve-animations"
  "emilkowalski/skill|skills/review-animations|review-animations"
  "pbakaus/impeccable|.claude/skills/impeccable|impeccable"
  "Leonxlnx/taste-skill|skills/taste-skill|taste-skill"
  "nextlevelbuilder/ui-ux-pro-max-skill|.claude/skills/ui-ux-pro-max|ui-ux-pro-max"
)

if [[ "${1:-}" == "--update" ]]; then
  TMP=$(mktemp -d)
  trap 'rm -rf "$TMP"' EXIT
  for entry in "${SKILLS[@]}"; do
    IFS='|' read -r repo path name <<<"$entry"
    dir="$TMP/${repo//\//__}"
    [[ -d "$dir" ]] || git clone -q --depth 1 "https://github.com/$repo" "$dir"
    rm -rf "${SRC:?}/$name"
    cp -RL "$dir/$path" "$SRC/$name"
    [[ -f "$dir/LICENSE" ]] && cp "$dir/LICENSE" "$SRC/$name/LICENSE.upstream"
    echo "↻ $name  ($repo)"
  done
  echo "Aktualisiert. Änderungen mit 'git diff' prüfen und committen."
  exit 0
fi

if [[ -n "${1:-}" ]]; then
  TARGET="$1/.claude/skills"
else
  TARGET="$HOME/.claude/skills"
fi
mkdir -p "$TARGET"

for entry in "${SKILLS[@]}"; do
  IFS='|' read -r _ _ name <<<"$entry"
  rm -rf "${TARGET:?}/$name"
  cp -R "$SRC/$name" "$TARGET/$name"
  echo "✓ $name"
done

echo
echo "Fertig. Skills liegen in $TARGET – Claude Code neu starten, damit sie geladen werden."
