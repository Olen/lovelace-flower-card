#!/usr/bin/env bash
# Open, or update, the plant PR that bundles this card release.
# Usage: scripts/plant-pr.sh <version> [--dry-run]
# Run it in a folder holding that release's flower-card.js and flower-card.js.LICENSE.txt.
set -euo pipefail

CARD_REPO="Olen/lovelace-flower-card"
PLANT_REPO="Olen/homeassistant-plant"
BRANCH="flower-card/update"
WWW="custom_components/plant/www"
NOTES_START="<!-- flower-card-notes:start -->"
NOTES_END="<!-- flower-card-notes:end -->"

version="$1"
mode="${2:-}"
card_build="$(pwd)"

# True when the first version is older than the second; a beta sorts before its release
is_older() {
    python3 - "$1" "$2" <<'EOF'
import re
import sys


def key(version):
    year, month, patch, beta = re.fullmatch(r"(\d+)\.(\d+)\.(\d+)(?:-beta(\d+))?", version).groups()
    return (int(year), int(month), int(patch), int(beta) if beta else float("inf"))


sys.exit(0 if key(sys.argv[1]) < key(sys.argv[2]) else 1)
EOF
}

plant_card_version() {
    gh api "repos/$PLANT_REPO/contents/$WWW/flower-card.version?ref=$1" --jq .content | base64 -d | tr -d '[:space:]'
}

notes_in_body() {
    printf '%s\n' "$1" | sed -n "/$NOTES_START/,/$NOTES_END/p" | sed '1d;$d'
}

if ! [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-beta[0-9]+)?$ ]]; then
    echo "Not a card version: $version" >&2
    exit 1
fi

title="Flower card $version"
if [[ "$version" == *beta* ]]; then
    title="$title (beta)"
fi

# Only the change lines: the release's own headings would nest inside plant's section
release_body=$(gh release view "v$version" --repo "$CARD_REPO" --json body --jq .body)
new_notes=$(printf '%s\n' "$release_body" | grep '^\* ' || true)
if [ -z "$new_notes" ]; then
    new_notes="* Flower card $version"
fi

# --head matches the branch name in forks too, so keep only plant's own branch
existing_pr=$(gh pr list --repo "$PLANT_REPO" --head "$BRANCH" --state open \
    --json number,isCrossRepository --jq '[.[] | select(.isCrossRepository == false)][0].number // empty')

main_version=$(plant_card_version main)
newest="$main_version"
if [ -n "$existing_pr" ]; then
    pending_version=$(plant_card_version "$BRANCH")
    if is_older "$newest" "$pending_version"; then
        newest="$pending_version"
    fi
fi

if is_older "$version" "$newest"; then
    echo "Plant already has flower card $newest, newer than $version" >&2
    exit 1
fi
if [ "$version" = "$main_version" ] && [ -z "$existing_pr" ]; then
    echo "Plant main already bundles flower card $version"
    exit 0
fi

notes="$new_notes"
if [ -n "$existing_pr" ]; then
    old_body=$(gh pr view "$existing_pr" --repo "$PLANT_REPO" --json body --jq .body)
    old_notes=$(notes_in_body "$old_body")
    notes="$old_notes"
    # A rerun for the same release must not list its changes twice
    while IFS= read -r line; do
        if ! printf '%s\n' "$old_notes" | grep -Fxq -- "$line"; then
            notes="$notes"$'\n'"$line"
        fi
    done <<< "$new_notes"
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
    # No open PR: a branch left by a closed one is stale, start over from main
    git checkout --quiet -B "$BRANCH" origin/main
fi

mkdir -p "$WWW"
cp "$card_build/flower-card.js" "$card_build/flower-card.js.LICENSE.txt" "$WWW/"
echo "$version" > "$WWW/flower-card.version"
git add "$WWW"
if git diff --cached --quiet; then
    echo "Plant's $BRANCH already has flower card $version"
else
    git commit --quiet -m "Flower card $version"
fi

if [ -n "$existing_pr" ]; then
    git push --quiet origin "$BRANCH"
else
    git push --quiet --force origin "$BRANCH"
fi
pushed=$(git rev-parse HEAD)

# The PR may have been merged while this ran; then this build needs a PR of its own
if [ -n "$existing_pr" ]; then
    state=$(gh pr view "$existing_pr" --repo "$PLANT_REPO" --json state --jq .state)
    if [ "$state" = "OPEN" ]; then
        gh pr edit "$existing_pr" --repo "$PLANT_REPO" --title "$title" --body "$body"
        gh pr merge "$existing_pr" --repo "$PLANT_REPO" --auto --merge --match-head-commit "$pushed"
        exit 0
    fi
    body=$(printf 'Bundles flower card %s.\n\n%s\n%s\n%s\n' "$version" "$NOTES_START" "$new_notes" "$NOTES_END")
fi

pr_url=$(gh pr create --repo "$PLANT_REPO" --base main --head "$BRANCH" \
    --title "$title" --body "$body" --label flower-card)
echo "$pr_url"
# Reviewed here already; plant merges it once its required checks pass (also set above, for retries)
gh pr merge "${pr_url##*/}" --repo "$PLANT_REPO" --auto --merge --match-head-commit "$pushed"
