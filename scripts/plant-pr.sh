#!/usr/bin/env bash
# Open, or update, the plant PR that bundles this card release.
# Usage: scripts/plant-pr.sh <version> [--dry-run]
set -euo pipefail

CARD_REPO="Olen/lovelace-flower-card"
PLANT_REPO="Olen/homeassistant-plant"
BRANCH="flower-card/update"
WWW="custom_components/plant/www"
NOTES_START="<!-- flower-card-notes:start -->"
NOTES_END="<!-- flower-card-notes:end -->"

version="$1"
mode="${2:-}"

if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta[0-9]+)?$ ]]; then
    echo "Not a card version: $version" >&2
    exit 1
fi

card_js="$(pwd)/flower-card.js"

title="Flower card $version"
if [[ "$version" == *beta* ]]; then
    title="$title (beta)"
fi

# Only the change lines: the release's own headings would nest inside plant's section
new_notes=$(gh release view "v$version" --repo "$CARD_REPO" --json body --jq .body | grep '^\* ' || true)
if [ -z "$new_notes" ]; then
    new_notes="* Flower card $version"
fi

existing_pr=$(gh pr list --repo "$PLANT_REPO" --head "$BRANCH" --state open --json number --jq '.[0].number // empty')

notes="$new_notes"
if [ -n "$existing_pr" ]; then
    old_body=$(gh pr view "$existing_pr" --repo "$PLANT_REPO" --json body --jq .body)
    old_notes=$(printf '%s\n' "$old_body" | sed -n "/$NOTES_START/,/$NOTES_END/p" | sed '1d;$d')
    notes="$old_notes"$'\n'"$new_notes"
fi

body=$(printf 'Bundles flower card %s.\n\n%s\n%s\n%s\n' "$version" "$NOTES_START" "$notes" "$NOTES_END")

if [ "$mode" = "--dry-run" ]; then
    printf '%s\n\n%s\n' "$title" "$body"
    exit 0
fi

workdir=$(mktemp -d)
gh auth setup-git
git clone --quiet "https://github.com/$PLANT_REPO.git" "$workdir"
cd "$workdir"
git config user.name "github-actions[bot]"
git config user.email "github-actions[bot]@users.noreply.github.com"

if [ -n "$existing_pr" ]; then
    git fetch --quiet origin "$BRANCH"
    git checkout --quiet -B "$BRANCH" "origin/$BRANCH"
else
    git checkout --quiet -B "$BRANCH" origin/main
fi

cp "$card_js" "$WWW/flower-card.js"
echo "$version" > "$WWW/flower-card.version"
git add "$WWW"
git commit --quiet -m "Flower card $version"
git push --quiet origin "$BRANCH"

if [ -n "$existing_pr" ]; then
    gh pr edit "$existing_pr" --repo "$PLANT_REPO" --title "$title" --body "$body"
else
    gh pr create --repo "$PLANT_REPO" --base main --head "$BRANCH" \
        --title "$title" --body "$body" --label flower-card
fi
