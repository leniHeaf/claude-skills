#!/usr/bin/env bash
# Installiert die Design-Skills für Claude Code mit einem einzigen Befehl.
#   bash install-skills.sh            -> ins aktuelle Projekt (.claude/skills)
#   bash install-skills.sh --global   -> für alle Projekte (~/.claude/skills)
set -euo pipefail

TARGET=".claude/skills"
[[ "${1:-}" == "--global" ]] && TARGET="$HOME/.claude/skills"
mkdir -p "$TARGET"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

fetch() { git clone -q --depth 1 "https://github.com/$1" "$TMP/${1//\//__}"; }

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

for entry in "${SKILLS[@]}"; do
  IFS='|' read -r repo path name <<<"$entry"
  dir="$TMP/${repo//\//__}"
  [[ -d "$dir" ]] || fetch "$repo"
  rm -rf "${TARGET:?}/$name"
  cp -RL "$dir/$path" "$TARGET/$name"
  echo "✓ $name  ($repo)"
done

echo
echo "Fertig. Skills liegen in $TARGET – starte Claude Code neu, damit sie geladen werden."
