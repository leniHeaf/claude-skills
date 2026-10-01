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
  "emilkowalski/skill|skills/animate-expo|animate-expo"
  "emilkowalski/skill|skills/animation-vocabulary|animation-vocabulary"
  "emilkowalski/skill|skills/apple-design|apple-design"
  "emilkowalski/skill|skills/ask-sonner|ask-sonner"
  "emilkowalski/skill|skills/find-animation-opportunities|find-animation-opportunities"
  "emilkowalski/skill|skills/mobile-native|mobile-native"
  "emilkowalski/skill|skills/pick-ui-library|pick-ui-library"
  "emilkowalski/skill|skills/prototype|prototype"
  "emilkowalski/skill|skills/write-swift|write-swift"
  "pbakaus/impeccable|.claude/skills/impeccable|impeccable"
  "Leonxlnx/taste-skill|skills/taste-skill|design-taste-frontend"
  "Leonxlnx/taste-skill|skills/taste-skill-v1|design-taste-frontend-v1"
  "Leonxlnx/taste-skill|skills/redesign-skill|redesign-existing-projects"
  "Leonxlnx/taste-skill|skills/soft-skill|high-end-visual-design"
  "Leonxlnx/taste-skill|skills/minimalist-skill|minimalist-ui"
  "Leonxlnx/taste-skill|skills/brutalist-skill|industrial-brutalist-ui"
  "Leonxlnx/taste-skill|skills/gpt-tasteskill|gpt-taste"
  "Leonxlnx/taste-skill|skills/stitch-skill|stitch-design-taste"
  "Leonxlnx/taste-skill|skills/output-skill|full-output-enforcement"
  "Leonxlnx/taste-skill|skills/image-to-code-skill|image-to-code"
  "Leonxlnx/taste-skill|skills/imagegen-frontend-web|imagegen-frontend-web"
  "Leonxlnx/taste-skill|skills/imagegen-frontend-mobile|imagegen-frontend-mobile"
  "Leonxlnx/taste-skill|skills/brandkit|brandkit"
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
rm -rf "$TARGET/taste-skill"  # alter Name von design-taste-frontend

for entry in "${SKILLS[@]}"; do
  IFS='|' read -r _ _ name <<<"$entry"
  rm -rf "${TARGET:?}/$name"
  cp -R "$SRC/$name" "$TARGET/$name"
  echo "✓ $name"
done

echo
echo "Fertig. Skills liegen in $TARGET – Claude Code neu starten, damit sie geladen werden."
